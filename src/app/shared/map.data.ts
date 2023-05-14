import { Position } from 'geojson';

/** Test parcours, from highway bridge to Nepomuk bridge */
const parcours_a: Position[] = [
  [7.609027254014222, 47.506450512010844],
  [7.608997305250142, 47.506418721048334],
  [7.608826169450452, 47.50629011195869],
  [7.608770550314631, 47.506163670130405],
  [7.608774828710324, 47.506063961502775],
  [7.6088361143128225, 47.50600245465037],
  [7.608825608332353, 47.5059835295107],
  [7.608834363315765, 47.505939765098645],
  [7.6087975923840645, 47.50587825829544],
  [7.608710042545084, 47.50580847164363],
  [7.608661014634862, 47.50575287882049],
  [7.60861548871884, 47.50567717786018],
  [7.608445642232482, 47.505551797478944],
  [7.608296807505781, 47.505478461894114],
  [7.608175988728306, 47.505440611230085],
  [7.6080761819118266, 47.50544652539787],
  [7.6079501104763665, 47.5054003941749],
  [7.607435317423153, 47.504916612597526],
  [7.607316251890467, 47.504859835183964],
  [7.60685507007733, 47.50424288781036],
  [7.606809544161308, 47.50402405812909],
  [7.606854998645019, 47.50366241991358],
  [7.606774193977401, 47.5035157170565],
  [7.606703489894727, 47.50344065962199],
  [7.606531779977189, 47.503304191284656],
  [7.6064105729764435, 47.50306537084063],
  [7.606329768310076, 47.502949371947324],
  [7.606213611601845, 47.5029118428391],
  [7.606375220935746, 47.50275149089077],
  [7.60644087731697, 47.50270713803434],
  [7.6063802738165975, 47.50262184417326],
  [7.606269167400768, 47.50255360898467],
  [7.606163111274753, 47.502369373532446],
  [7.606137859816357, 47.50213054883568],
  [7.605991402127614, 47.50185419138205],
  [7.605849993960874, 47.50148230309074],
  [7.605693434919459, 47.50100464453979],
  [7.605582328502294, 47.50052356974982],
  [7.605557077043869, 47.50039050573179],
  [7.605536875876709, 47.500318855736055],
  [7.605435870043124, 47.500257441376476],
  [7.605329814165884, 47.50011755097188],
  [7.605289411832729, 47.49982071309577],
  [7.605264160374304, 47.49906666910627],
  [7.605274260956634, 47.498595812615775],
  [7.60518335428506, 47.4983194372449],
  [7.605329812744259, 47.497582432120595],
  [7.605398994017207, 47.49733708786076],
  [7.605604885911873, 47.49656624772561],
  [7.6055362585969135, 47.49602722888076],
  [7.6051502299476965, 47.495615716145096],
  [7.605030132145913, 47.49547081652727],
  [7.604961504829845, 47.49531432449055],
  [7.605038710559427, 47.495076687542735],
  [7.605030132145913, 47.49474631243848],
  [7.605090181046222, 47.49450287682109],
  [7.605253170920122, 47.4941319251389],
  [7.605167382257633, 47.493743580562295],
  [7.605124490185489, 47.493418993290504],
  [7.604952921896938, 47.49317555151998],
  [7.604832824095155, 47.49304803395171],
  [7.604807088852397, 47.49289153469476],
  [7.605218852744429, 47.49218438408889],
  [7.605390421032951, 47.49179023043828],
  [7.605476205177268, 47.49159315250327],
  [7.6057336203843136, 47.49117576080772],
  [7.605896610258213, 47.49106562782299],
  [7.606008129646455, 47.49093230863832],
  [7.60611107061888, 47.490706244898774],
  [7.606248325249993, 47.49034685951534],
  [7.606351266222418, 47.49004543762007],
  [7.606488520853475, 47.489749810619514],
  [7.606625763155364, 47.489373027681495],
  [7.606771596201071, 47.489141160539816],
  [7.606823066687866, 47.48888610550097],
  [7.606848801930681, 47.4887585775173],
  [7.6069860565617375, 47.488613658978096],
  [7.607011791804609, 47.4885151141431],
  [7.606968899732436, 47.48840497557936],
  [7.607011791804609, 47.4883470078214]
];

/** Parcours, as defined in workshop meeting on 24.02.2023 */
const parcours_b: Position[] = [
  [7.6088222688889005, 47.50629940174187],
  [7.608677129873286, 47.506331322621804],
  [7.608569119443217, 47.506331322621804],
  [7.608461109013092, 47.50630396186861],
  [7.608380101191159, 47.506265200777875],
  [7.608312594672668, 47.5062309997916],
  [7.608245088154177, 47.50618539844143],
  [7.608184332286726, 47.50614435719274],
  [7.608120201094437, 47.50608507533235],
  [7.608062820553187, 47.50601895317871],
  [7.6079986893608975, 47.505948270784046],
  [7.60789068143481, 47.50584110632522],
  [7.607769169701243, 47.505731662205875],
  [7.607691537204175, 47.505647298875346],
  [7.6076476579677035, 47.50555609512165],
  [7.607610529382242, 47.5054261294992],
  [7.607570025470579, 47.50533264525603],
  [7.607536272211348, 47.50526424204551],
  [7.607475519983694, 47.505141114576645],
  [7.60741813944378, 47.50504306958953],
  [7.607343882272886, 47.50491538282074],
  [7.607283126405434, 47.504821897667966],
  [7.607161614671924, 47.504650887811295],
  [7.607002974352866, 47.50443655467069],
  [7.606932095446609, 47.50435218729021],
  [7.606857838275687, 47.50423817976073],
  [7.606834210995032, 47.50414925371592],
  [7.606817334365417, 47.50403752590765],
  [7.606824085016484, 47.50390299619039],
  [7.606840961646071, 47.50380266871912],
  [7.606847712298475, 47.503731983340145],
  [7.606847712298475, 47.50364077625869],
  [7.60681733607106, 47.503586051610114],
  [7.6067532048773785, 47.50349028390434],
  [7.606746454369215, 47.50344924056134],
  [7.606763330998888, 47.503412757551246],
  [7.606743079043042, 47.50334891222283],
  [7.60669919980657, 47.503212100543124],
  [7.606668821873512, 47.50311861235704],
  [7.606641821121173, 47.50303880503682],
  [7.606587815906153, 47.50295443737801],
  [7.60654393666826, 47.502870069583565],
  [7.606503432756625, 47.502794822517615],
  [7.606462928846355, 47.50273325665634],
  [7.606422424934692, 47.50268081160584],
  [7.606361669068633, 47.50261696538726],
  [7.6062772859191625, 47.5025553993174],
  [7.606230033651684, 47.502500673541505],
  [7.606182779089011, 47.502425425946086],
  [7.606165902459367, 47.50235245847756],
  [7.606152401155953, 47.5022680897157],
  [7.606152401155953, 47.50220652323671],
  [7.606122023221502, 47.5021016320313],
  [7.606078143985059, 47.50201726286679],
  [7.606064643722192, 47.50197849725433],
  [7.606020764484413, 47.501916930435755],
  [7.605976885247912, 47.501809758393506],
  [7.60593975666248, 47.501711707184285],
  [7.605906003403248, 47.50161137552516],
  [7.6058790007949995, 47.50154524773578],
  [7.605838496884758, 47.50140159052751],
  [7.605787866995854, 47.50127389490069],
  [7.605747363084248, 47.50113935810117],
  [7.6057102362390765, 47.50102306290813],
  [7.605669732327414, 47.500931851120185],
  [7.605652855697798, 47.5007950331414],
  [7.605632603741981, 47.500692419423586],
  [7.605615727112394, 47.50057840394595],
  [7.605585349179336, 47.50044614568165],
  [7.605568472909738, 47.50037545475084],
  [7.605538094975316, 47.500318446699026],
  [7.605477339109228, 47.500277400863325],
  [7.605409832590766, 47.500234074668356],
  [7.605359202701891, 47.500170225474164],
  [7.605332200093642, 47.50009497453843],
  [7.605318698790228, 47.500017443158356],
  [7.605308572813016, 47.49990342621484],
  [7.605298446834439, 47.49979396971605],
  [7.605288320857198, 47.499693634391946],
  [7.6052748195537845, 47.49958645781106],
  [7.605271444910301, 47.4995043643751],
  [7.60526469425929, 47.499397187407936],
  [7.605268069584099, 47.49926720653721],
  [7.60526469425929, 47.4991805524443],
  [7.60526469425929, 47.49906881406119],
  [7.605278195562732, 47.49896391658723],
  [7.6052849462137715, 47.498817971927],
  [7.605291697530163, 47.49868342828836],
  [7.605281571552922, 47.49861729681146],
  [7.605261319597105, 47.49851467883687],
  [7.605214065034431, 47.49842802350247],
  [7.605187062426239, 47.49835733088628],
  [7.605200563731046, 47.49823190826962],
  [7.605230941961764, 47.49812700898602],
  [7.60525119391761, 47.49799702497077],
  [7.605274821198265, 47.497896686212584],
  [7.605305199132658, 47.49777354292874],
  [7.605325451088447, 47.49768916680887],
  [7.605325451088447, 47.4975660230383],
  [7.60534232771812, 47.49747480524482],
  [7.605396332931775, 47.497388148194176],
  [7.605423335398768, 47.49728552765836],
  [7.605460463984201, 47.49716922432242],
  [7.6055043432207015, 47.49702783560613],
  [7.605541471806106, 47.49688872698118],
  [7.605568474414326, 47.49675873990043],
  [7.605585350211271, 47.49667436165504],
  [7.6055988515147135, 47.496539813069006],
  [7.605585350211271, 47.49640526413825],
  [7.605561722929281, 47.496250190366396],
  [7.605548221625867, 47.49610879917546],
  [7.6055279696700495, 47.49604494496444],
  [7.605440210338855, 47.495933199501906],
  [7.605349076538346, 47.49583285679981],
  [7.605268068716441, 47.49575531912592],
  [7.605173559589758, 47.495657256609434],
  [7.605068924485806, 47.49552270541719],
  [7.605011543944556, 47.49543832567986],
  [7.604967664708084, 47.495360787423806],
  [7.604971040034286, 47.49527184634161],
  [7.605004793403509, 47.49516466123612],
  [7.605018294706895, 47.49510992807569],
  [7.605018294706895, 47.49502554767554],
  [7.605018294706895, 47.49491836156582],
  [7.605018294706895, 47.49482941973423],
  [7.6050317960116445, 47.494758722273474],
  [7.605045297315087, 47.494674341308496],
  [7.605062194849324, 47.49456257937342],
  [7.60508244680517, 47.494485039823786],
  [7.605133076694045, 47.49439381667793],
  [7.605180331258026, 47.494298032203886],
  [7.605227585820728, 47.494197686377106],
  [7.605224209960909, 47.49412014570291],
  [7.60520395800512, 47.49404032490435],
  [7.605180330723101, 47.4939171725768],
  [7.605176955398264, 47.49380542299261],
  [7.605176955398264, 47.49370507622453],
  [7.605163454093486, 47.493600168034334],
  [7.605126325507996, 47.49347701467457],
  [7.6050824462715525, 47.49334701914805],
  [7.604991311729151, 47.49324895176309],
  [7.604923805210717, 47.493164568372094],
  [7.604856298692198, 47.49305509782488],
  [7.604829296083977, 47.49298211733375],
  [7.604819170106765, 47.49290001415969],
  [7.604839422062554, 47.49281791085727],
  [7.604900177928698, 47.492717562201705],
  [7.604971059773362, 47.49260581006476],
  [7.605038565880989, 47.492503180332164],
  [7.605099321747133, 47.492398269741386],
  [7.6051870802214125, 47.49227739423529],
  [7.605237710110259, 47.492163360484],
  [7.605281589348095, 47.49204704580288],
  [7.605338969410724, 47.49188967755535],
  [7.605389599299599, 47.49177336226808],
  [7.605484108426282, 47.49159090639634],
  [7.6055651162481865, 47.4914745904473],
  [7.605673126678369, 47.49130581782748],
  [7.605747383849234, 47.491173536205764],
  [7.6057473836283975, 47.491143886022485]
];

export const parcours = parcours_b;