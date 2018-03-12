"use strict";

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

Vue.use(VueFusionCharts);

Vue.component("about", {
  template:
    '<div class="about-redeploy">\n  <h1 class="h2" style="padding-bottom: 12px; border-bottom: 1px solid #ddd;">About Adult Redeploy Illinois</h1>\n  <p>ARI was established by the\n    <a href="http://www.ilga.gov/legislation/publicacts/fulltext.asp?Name=096-0761">Crime Reduction Act</a> (Public Act 96-0761) to provide financial incentives to local jurisdictions for programs that\n    allow diversion of non-violent offenders from state prisons by providing community-based services. Grants are provided\n    to counties, groups of counties, and judicial circuits to increase programming in their areas, in exchange for reducing\n    the number of people they send to the Illinois Department of Corrections.</p>\n\n  <p>The Crime Reduction Act is based on the premise that crime can be reduced and the costs of the criminal justice system\n    can be controlled by understanding and addressing the reasons why people commit crimes. It is also based on the premise\n    that local jurisdictions (judicial circuits or counties) know best what resources are necessary to reduce crime. Rigorous\n    evaluation processes with standardized performance measurements are required to confirm the effectiveness of services\n    in reducing crime. </p>\n\n  <p>ARI is modeled after the successful juvenile Redeploy Illinois program operating since 2005. ARI is an example of the\n    \u201Cperformance incentive funding\u201D best practice, intended to align fiscal and operational responsibility for non-violent\n    offenders at the local level to produce better public safety at a lower cost. ARI draws on concepts of justice reinvestment,\n    such as using data to implement strategies that drive down corrections costs and free up dollars for investment in\n    community-based programs addressing recidivism.</p>\n\n  <p>The goals of ARI are to:</p>\n  <ul>\n    <li>Reduce crime and recidivism in a way that is cost effective for taxpayers.</li>\n    <li>Provide financial incentives to counties or judicial circuits to create effective local-level evidence-based services.</li>\n    <li>Encourage the successful local supervision of eligible offenders and their reintegration into the locality.</li>\n    <li>Perform rigorous data collection and analysis to assess the outcomes of the programs.</li>\n  </ul>\n\n  <p>Results expected with Adult Redeploy Illinois include reduced prison overcrowding; lowered cost to taxpayers; an end\n    to the expensive vicious cycle of crime and incarceration. </p>\n\n  <p>As of June 2017, Adult Redeploy Illinois has\n    <strong>20 local sites</strong> operating\n    <strong>39 diversion programs</strong> serving\n    <strong>39 counties</strong>. Additionally, ARI funds planning in areas covering\n    <strong>10 additional counties</strong>.</p>\n\n</div>',
  data: function data() {
    return {};
  },

  methods: {}
});

var app = new Vue({
  el: "#app",

  mounted: function mounted() {
    this.initializeChart();
    this.initializeCountySelect();
  },

  methods: {
    stringToKebabCase: function stringToKebabCase(string) {
      return string
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/\s+/g, "-")
        .toLowerCase();
    },
    consoleCallback: function consoleCallback(val) {
      console.dir(JSON.stringify(val));
    },
    toggleViz: function toggleViz() {
      this.visibility = !this.visibility;
    },
    initializeCountySelect: function initializeCountySelect() {
      // Grab all unique titles
      var data = _.uniqBy(this.fm.data, function(elem) {
        return JSON.stringify(_.pick(elem, ["title"]));
      });

      // Remove unncessary keys
      data = _.map(data, function(o) {
        return _.omit(o, ["toolText", "value", "displayValue"]);
      });

      // Alphabetize
      data = _.orderBy(data, ["title"], ["asc"]);

      // Finally, remove any elements that don't contain 'title' keys
      data = _.filter(data, function(o) {
        return typeof o.title !== "undefined";
      });

      // for (let [key, val] of Object.entries(data))
      //     val.label = val.title

      //console.log(data.length)

      this.selectData = data;

      return;
    },
    initializeChart: function initializeChart() {
      this.renderChart(this, this.setChartEvents(this));
    },
    getSelection: function getSelection(e) {
      this.selected = "" + e.target.value;
      this.countyMetaData = this.getCountyMetaData("id", this.selected);
      this.loadFactSheet(this.countyMetaData.title);
    },

    getFirstFactSheet: function getFirstFactSheet() {
      this.selected = this.fm.data[0].id;
      this.countyMetaData = this.getCountyMetaData("id", this.selected);
      this.loadFactSheet(this.countyMetaData.title);
    },

    getCountyMetaData: function getCountyMetaData(key, value) {
      var myObj;
      if (key === "title") {
        myObj = _.find(this.fm.data, {
          title: value
        });
      }
      if (key === "id") {
        myObj = _.find(this.fm.data, {
          id: value
        });
      }
      return myObj;
    },
    loadFactSheet: function loadFactSheet(t) {
      var _this = this;

      this.visibility = true;
      //var siteUrl = `https://adultredeployil.us/sites/` + this.stringToKebabCase(this.countyMetaData.title)
      var siteUrl = "https://adultredeployil.us/sites/site-001";
      console.log("Site url for factsheet: ", siteUrl);
      this.countyMetaData.factSheet =
        '<div class="text-center" style="margin-top: 30px"></div>';
      axios
        .get(siteUrl)
        .then(function(response) {
          _this.countyMetaData.factSheet = response.data;
          _this.$forceUpdate();
          //console.log(response.data)
        })
        .catch(function(e) {
          console.log("Error: ", e);
        });
    },
    renderFactSheet: function renderFactSheet(str) {
      this.countyMetaData.factSheet = str;
      $(".panel-text").html(str);
      this.$forceUpdate();
    },
    setChartEvents: function setChartEvents(vm) {
      var fusionEventsObj = {
        entityClick: function entityClick(evt, data) {
          vm.countyId = data.id;

          var metaData = vm.getCountyMetaData("id", vm.countyId);
          //console.log(metaData.displayValue)

          if (metaData.displayValue != "") {
            vm.countyMetaData = metaData;
            vm.visibility = true;
            //console.log('click')
            vm.loadFactSheet(vm.countyMetaData.title);
            vm.selected = vm.countyMetaData.id;
          }
        }
      };
      return fusionEventsObj;
    },
    renderChart: function renderChart(vm, fusionEventsObj) {
      FusionCharts.ready(function() {
        this.ariMap = new FusionCharts({
          type: "illinois",
          renderAt: "chart-container",
          width: "600",
          height: "700",
          events: fusionEventsObj,
          dataSource: {
            chart: vm.fm.chart,
            colorrange: vm.fm.colorrange,
            data: vm.fm.data
          }
        }).render();
      });
    }
  },
  data: function data() {
    var _chart;

    return {
      selected: "",
      selected2: "",
      countyId: "",
      visibility: false,
      countyMetaData: {},
      vm: this,
      selectData: [],
      testData: [],
      fm: {
        chart: ((_chart = {
          caption: "Adult Redeploy Illinois SFY 2017",
          subCaption: "Click county to display fact sheet",
          captionFontSize: "18",
          captionFontColor: "#222222",
          subcaptionFontSize: "14",
          subcaptionFontColor: "#888888",
          animation: "0",
          showBevel: "0",
          showCanvasBorder: "0",
          includeValueInLabels: "1",
          baseFontSize: "9",
          showToolTip: "1",
          showLabels: "0",
          includeNameInLabels: "0",
          showMarkerLabels: "1",
          fontBold: "1",
          hoverColor: "#eeeeee",
          exportenabled: "0",
          showexportdatamenuitem: "0",
          showprintmenuitem: "0",
          useHoverColor: "1",
          hoverOnEmpty: "1",
          borderColor: "#777777",
          legendPosition: "BOTTOM",
          legendItemFontSize: "12",
          legendItemFontColor: "#333333",
          connectorColor: "#aaaaaa",
          fillColor: "#ffffff",
          showLegend: "1"
        }),
        _defineProperty(_chart, "legendPosition", "bottom"),
        _defineProperty(_chart, "baseFontColor", "#aaaaaa"),
        _chart),
        colorrange: {
          color: [
            {
              minValue: "0",
              maxValue: "500",
              displayValue: "ARI SFY17 sites",
              color: "#2e2a7a"
            },
            {
              minValue: "500",
              maxValue: "1000",
              displayValue: "ARI planning grant counties",
              color: "#5a53f2"
            }
          ]
        },
        data: [
          {
            id: "001",
            displayValue: "AD",
            value: "500",
            toolText: "Adams",
            title: "Adams County"
          },
          {
            id: "003",
            displayValue: ""
          },
          {
            id: "005",
            displayValue: ""
          },
          {
            id: "007",
            displayValue: "BO",
            value: "10",
            toolText: "Boone",
            title: "Boone County"
          },
          {
            id: "009",
            displayValue: ""
          },
          {
            id: "011",
            displayValue: ""
          },
          {
            id: "013",
            displayValue: ""
          },
          {
            id: "015",
            displayValue: ""
          },
          {
            id: "017",
            displayValue: ""
          },
          {
            id: "019",
            displayValue: ""
          },
          {
            id: "021",
            displayValue: "CI",
            value: "10",
            toolText: "Christian",
            title: "Christian County"
          },
          {
            id: "023",
            displayValue: ""
          },
          {
            id: "025",
            displayValue: "CY",
            value: "500",
            toolText: "Clay",
            title: "Clay County"
          },
          {
            id: "027",
            displayValue: ""
          },
          {
            id: "029",
            displayValue: ""
          },
          {
            id: "031",
            displayValue: "CK",
            value: "10",
            toolText: "Cook",
            title: "Cook County"
          },
          {
            id: "033",
            displayValue: "CF",
            value: "10",
            toolText: "Crawford",
            title: "Crawford County"
          },
          {
            id: "035",
            displayValue: ""
          },
          {
            id: "037",
            displayValue: "DE",
            value: "10",
            toolText: "DeKalb",
            title: "DeKalb County"
          },
          {
            id: "039",
            displayValue: ""
          },
          {
            id: "041",
            displayValue: ""
          },
          {
            id: "043",
            displayValue: "DP",
            value: "10",
            toolText: "DuPage",
            title: "DuPage County"
          },
          {
            id: "045",
            displayValue: ""
          },
          {
            id: "047",
            displayValue: "EW",
            value: "10",
            toolText: "Edwards",
            title: "Edwards County"
          },
          {
            id: "049",
            displayValue: "EF",
            value: "10",
            toolText: "Effingham",
            title: "Effingham County"
          },
          {
            id: "051",
            displayValue: "FA",
            value: "500",
            toolText: "Fayette",
            title: "Fayette County"
          },
          {
            id: "053",
            displayValue: ""
          },
          {
            id: "055",
            displayValue: "FR",
            value: "10",
            toolText: "Franklin",
            title: "Franklin County"
          },
          {
            id: "057",
            displayValue: "FU",
            value: "10",
            toolText: "Fulton",
            title: "Fulton County"
          },
          {
            id: "059",
            displayValue: "GA",
            value: "10",
            toolText: "Gallatin",
            title: "Gallatin County"
          },
          {
            id: "061",
            displayValue: "GR",
            value: "500",
            toolText: "Greene",
            title: "Greene County"
          },
          {
            id: "063",
            displayValue: "GU",
            value: "10",
            toolText: "Grundy",
            title: "Grundy County"
          },
          {
            id: "065",
            displayValue: "HA",
            value: "10",
            toolText: "Hamilton",
            title: "Hamilton County"
          },
          {
            id: "067",
            displayValue: "HC",
            value: "10",
            toolText: "Hancock",
            title: "Hancock County"
          },
          {
            id: "069",
            displayValue: "HR",
            value: "10",
            toolText: "Hardin",
            title: "Hardin County"
          },
          {
            id: "071",
            displayValue: "HE",
            value: "10",
            toolText: "Henderson",
            title: "Henderson County"
          },
          {
            id: "073",
            displayValue: ""
          },
          {
            id: "075",
            displayValue: ""
          },
          {
            id: "077",
            displayValue: ""
          },
          {
            id: "079",
            displayValue: "JS",
            value: "500",
            toolText: "Jasper",
            title: "Jasper County"
          },
          {
            id: "081",
            displayValue: "JE",
            value: "10",
            toolText: "Jefferson",
            title: "Jefferson County"
          },
          {
            id: "083",
            displayValue: "JR",
            value: "10",
            toolText: "Jersey",
            title: "Jersey County"
          },
          {
            id: "085",
            displayValue: ""
          },
          {
            id: "087",
            displayValue: ""
          },
          {
            id: "089",
            displayValue: ""
          },
          {
            id: "091",
            displayValue: ""
          },
          {
            id: "093",
            displayValue: "KD",
            value: "10",
            toolText: "Kendall",
            title: "Kendall County"
          },
          {
            id: "095",
            displayValue: "KO",
            value: "10",
            toolText: "Knox",
            title: "Knox County"
          },
          {
            id: "097",
            displayValue: "LA",
            value: "10",
            toolText: "Lake",
            title: "Lake County"
          },
          {
            id: "099",
            displayValue: "LS",
            value: "10",
            toolText: "LaSalle",
            title: "LaSalle County"
          },
          {
            id: "101",
            displayValue: "LW",
            value: "10",
            toolText: "Lawrence",
            title: "Lawrence County"
          },
          {
            id: "103",
            displayValue: ""
          },
          {
            id: "105",
            displayValue: ""
          },
          {
            id: "107",
            displayValue: ""
          },
          {
            id: "109",
            displayValue: "MD",
            value: "10",
            toolText: "McDonough",
            title: "McDonough County"
          },
          {
            id: "111",
            displayValue: ""
          },
          {
            id: "113",
            displayValue: "ML",
            value: "10",
            toolText: "McLean",
            title: "McLean County"
          },
          {
            id: "115",
            displayValue: "MA",
            value: "10",
            toolText: "Macon",
            title: "Macon County"
          },
          {
            id: "117",
            displayValue: "MP",
            value: "500",
            toolText: "Macoupin",
            title: "Macoupin County"
          },
          {
            id: "119",
            displayValue: "MI",
            value: "10",
            toolText: "Madison",
            title: "Madison County"
          },
          {
            id: "121",
            displayValue: ""
          },
          {
            id: "123",
            displayValue: ""
          },
          {
            id: "125",
            displayValue: ""
          },
          {
            id: "127",
            displayValue: ""
          },
          {
            id: "129",
            displayValue: ""
          },
          {
            id: "131",
            displayValue: ""
          },
          {
            id: "133",
            displayValue: "ME",
            value: "10",
            toolText: "Monroe",
            title: "Monroe County"
          },
          {
            id: "135",
            displayValue: ""
          },
          {
            id: "137",
            displayValue: "MG",
            value: "500",
            toolText: "Morgan",
            title: "Morgan County"
          },
          {
            id: "139",
            displayValue: ""
          },
          {
            id: "141",
            displayValue: ""
          },
          {
            id: "143",
            displayValue: "PE",
            value: "10",
            toolText: "Peoria",
            title: "Peoria County"
          },
          {
            id: "145",
            displayValue: "PR",
            value: "500",
            toolText: "Perry",
            title: "Perry County"
          },
          {
            id: "147",
            displayValue: ""
          },
          {
            id: "149",
            displayValue: ""
          },
          {
            id: "151",
            displayValue: ""
          },
          {
            id: "153",
            displayValue: ""
          },
          {
            id: "155",
            displayValue: ""
          },
          {
            id: "157",
            displayValue: "RA",
            value: "10",
            toolText: "Randolph",
            title: "Randolph County"
          },
          {
            id: "159",
            displayValue: "RI",
            value: "10",
            toolText: "Richland",
            title: "Richland County"
          },
          {
            id: "161",
            displayValue: ""
          },
          {
            id: "163",
            displayValue: "SC",
            value: "10",
            toolText: "St. Clair",
            title: "St. Clair County"
          },
          {
            id: "165",
            displayValue: ""
          },
          {
            id: "167",
            displayValue: "SN",
            value: "10",
            toolText: "Sangamon",
            title: "Sangamon County"
          },
          {
            id: "169",
            displayValue: ""
          },
          {
            id: "171",
            displayValue: "ST",
            value: "500",
            toolText: "Scott",
            title: "Scott County"
          },
          {
            id: "173",
            displayValue: ""
          },
          {
            id: "175",
            displayValue: ""
          },
          {
            id: "177",
            displayValue: ""
          },
          {
            id: "179",
            displayValue: ""
          },
          {
            id: "181",
            displayValue: ""
          },
          {
            id: "183",
            displayValue: ""
          },
          {
            id: "185",
            displayValue: "WA",
            value: "10",
            toolText: "Wabash",
            title: "Wabash County"
          },
          {
            id: "187",
            displayValue: "WR",
            value: "10",
            toolText: "Warren",
            title: "Warren County"
          },
          {
            id: "189",
            displayValue: "WS",
            value: "500",
            toolText: "Washington",
            title: "Washington County"
          },
          {
            id: "191",
            displayValue: "WY",
            value: "10",
            toolText: "Wayne",
            title: "Wayne County"
          },
          {
            id: "193",
            displayValue: "WH",
            value: "10",
            toolText: "White",
            title: "White County"
          },
          {
            id: "195",
            displayValue: ""
          },
          {
            id: "197",
            displayValue: "WI",
            value: "10",
            toolText: "Will",
            title: "Will County"
          },
          {
            id: "199",
            displayValue: ""
          },
          {
            id: "201",
            displayValue: "WB",
            value: "10",
            toolText: "Winnebago",
            title: "Winnebago County"
          },
          {
            id: "203",
            displayValue: ""
          }
        ]
      }
    };
  }
});
