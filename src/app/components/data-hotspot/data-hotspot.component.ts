import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EChartsOption } from 'echarts';
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
  summarySelection = new FormControl<number>(1);
  chartAutoHeight = false;

  constructor(
    private hotspotService: HotspotService,
    private dataService: DataService
  ) {
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 6))
      .subscribe(hotspot => {
        if (hotspot && hotspot.type === 6) {
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
        bottom: 60,
      },
      color: ['#ff4081cc'],
      xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
          interval: 0,
          formatter: (value: string) => {
            let label = ''; // Returned string
            const maxLength = 5; // Maximum number of characters per line
            const words = value.split(' '); // Split the label into words
            let lineLength = 0; // Current line length
            for (var i = 0; i < words.length; i++) {
              var word = words[i];
              // If adding the new word to the current line would be too long,
              // then put the word on the next line
              if (lineLength + word.length > maxLength) {
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
            position: 'top',
            fontSize: 16,
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
        if (this.hotspotPayload === undefined) this.hotspotPayload = data;
        else this.hotspotPayload.datapoints = data.datapoints;
        this.updateOptions = {
          xAxis: {
            data: data.datapoints.map((d: any) => d.tag)
          },
          series: [
            { data: data.datapoints.map((d: any) => d.pax_avg) }
          ]
        };
      });
    }
  }

}
