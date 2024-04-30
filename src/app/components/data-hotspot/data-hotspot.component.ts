import { Component, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EChartsOption, DefaultLabelFormatterCallbackParams } from 'echarts';
import { filter } from 'rxjs';
import { DataService } from 'src/app/services';
import { HotspotData, HotspotDataPayload, HotspotService } from 'src/app/services/hotspot.service';

@Component({
  selector: 'app-data-hotspot',
  templateUrl: './data-hotspot.component.html',
  styleUrls: ['./data-hotspot.component.css']
})
export class DataHotspotComponent {

  hotspot?: HotspotData;
  hotspotPayload?: HotspotDataPayload;
  options?: EChartsOption;
  chartInstance?: echarts.ECharts;
  updateOptions: EChartsOption = {};
  summarySelection = new FormControl<number>(0);
  chartAutoHeight = false;

  constructor(
    private hotspotService: HotspotService,
    private dataService: DataService
  ) {
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 6))
      .subscribe(hotspot => {
        if (hotspot && hotspot.type === 6) {
          if (hotspot.id !== this.hotspot?.id) {
            this.hotspotPayload = undefined;
            this.summarySelection.setValue(0, { emitEvent: false });
            // reset the echarts instance
            this.chartInstance?.clear();
            this.chartInstance?.setOption(this.options!, true);
          }
          this.hotspot = hotspot;
          this.queryDataHotspots();
        };
    });

    this.summarySelection.valueChanges.subscribe(value => {
      this.queryDataHotspots(value ?? undefined);
    });

    this.options = {
      grid: {
        top: 20,
        bottom: 100,
      },
      color: ['#ff4081cc'],
      xAxis: {
        type: 'category',
        axisLabel: {
          interval: 0,
          overflow: 'break',
          rich: {
            a: {
              lineHeight: 15,
              align: 'right',
            }
          },
          formatter: (value: string) => {
            let label = ''; // Returned string
            const maxLength = 10; // Maximum number of characters per line
            const words = value.split(' '); // Split the label into words
            let lineLength = 0; // Current line length
            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              // If adding the new word to the current line would be too long,
              // then put the word on the next line
              if (lineLength + word.length > maxLength && i > 0) {
                label += '\n';
                lineLength = 0;
              }
              // If it's not the first word on the line, add a space before it
              if (lineLength > 0) {
                label += ' ';
                lineLength++;
              }
              label += word;
              lineLength += word.length;
            }
            label.split('\n').forEach((l, i) => {
              const l_uppercase = l[0].toUpperCase() + l.slice(1);
              label = label.replace(l, `{a|${l_uppercase}}`);
            });
            return label;
          }
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [],
          type: 'bar',
          label: {
            show: true,
            color: '#000',
          },
        }
      ]
    };
  }

  onChartInit(ec: echarts.ECharts) {
    this.chartInstance = ec;
    this.setChartHeight();
  }

  @HostListener('window:resize', ['$event'])
  private setChartHeight() {
    if (this.chartInstance) {
      if (window.innerHeight < window.innerWidth) {
        this.chartAutoHeight = true;
        this.chartInstance.resize({ height: window.innerHeight * 0.75 });
      } else {
        this.chartAutoHeight = false;
        this.chartInstance.resize({ height: 'auto' });
      }
    }
  }

  private queryDataHotspots(summaryOption?: number) {
    if (this.hotspot !== undefined) {;
      this.dataService.queryDataHotspots(this.hotspot.endpoint, summaryOption).subscribe(data => {
        if (data.chart === 'bar') {
          if (this.hotspotPayload === undefined) this.hotspotPayload = data;
          else this.hotspotPayload.datapoints = data.datapoints;
          this.updateOptions = {
            grid: {
              bottom: 60,
            },
            xAxis: {
              data: data.datapoints.map(d => d.tag)
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                type: 'bar',
                data: data.datapoints.map(d => d.pax_avg),
                label: {
                  position: 'top',
                  fontSize: 16,
                }
              }
            ]
          };
        } else if (data.chart === 'heatmap') {
          // const max = Math.max(...data.datapoints.map(d => d.count));
          const classes = [...(new Set(data.datapoints.map(d => d.class)))];
          const months = [...(new Set(data.datapoints.map(d => d.month)))];
          const minMonth = Math.min(...months);
          const maxMonth = Math.max(...months);

          // get all records for each class
          const records = [...(new Set(data.datapoints.map(d => d.class)))].map(c => data.datapoints.filter(d => d.class === c));

          // fill in the missing months
          records.forEach(r => {
            const months = r.map(d => d.month);
            for (let i = minMonth; i <= maxMonth; i++) {
              if (!months.includes(i)) r.push({ class: r[0].class, month: i, count: 0. });
            }
            r.sort((a, b) => a.month - b.month);
          });

          // normalise the counts for each class
          records.forEach(r => {
            //const max = Math.max(...r.map(d => d.count));
            const sum = r.reduce((a, b) => a + b.count, 0);
            r.forEach(d => d.count = d.count / sum);
          });

          // reduce the array of arrays to a single array
          data.datapoints = records.reduce((a, b) => a.concat(b), []);

          if (this.hotspotPayload === undefined) this.hotspotPayload = data;
          else this.hotspotPayload.datapoints = data.datapoints;

          this.updateOptions = {
            grid: {
              bottom: 100,
            },
            xAxis: {
              type: 'category',
              axisLabel: {
                rotate: 90,
                verticalAlign: 'middle',
                lineHeight: 0,
              }
            },
            yAxis: {
              type: 'category',
              name: 'Monat',
              nameLocation: 'middle',
              nameRotate: 90,
            },
            visualMap: {
              min: 0,
              max: 1,
              calculable: true,
              orient: 'horizontal',
              show: false,
              left: 'center',
              inRange: {
                color: ['#ffffffaa', '#ff4081aa'],
              }
            },
            series: [
              {
                type: 'heatmap',
                data: data.datapoints.map(d => [d.class, d.month, d.count]),
                label: {
                  color: '#000',
                  show: true,
                  formatter: (p: DefaultLabelFormatterCallbackParams) => (Array.isArray(p.data) ? (100 * +p.data[2]!).toFixed(1) : 0) + '%'
                }
              }
            ]
          };
        }
        // if summarySelection is not set, set it to the first option
        if (this.summarySelection.value === 0) this.summarySelection.setValue(this.hotspotPayload!.summaryOptions[0].value, { emitEvent: false });
      });
    }
  }

}
