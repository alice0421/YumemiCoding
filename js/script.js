app = Vue.createApp({
  data: () => ({
    prefectures: null, // APIから取得した都道府県を格納
    selectPrefectures: [], // チェックした都道府県(prefName)とコード(prefCode)を格納
    selectPopulations: [], // チェックした都道府県(prefName)と総人口(prefPopulation)を格納
  }),
  mounted: function () {
    // 読み込み時にのみ1回だけ都道府県取得APIを呼び出す
    this.getPrefectures();
    this.drawGraph();
  },
  watch: {
    selectPrefectures: function (new_selectPrefectures, old_selectPrefectures) {
      var self = this;

      // 都道府県のチェックが1つも選択されていないときはAPIを呼び出さない
      if (
        old_selectPrefectures.length === 1 &&
        new_selectPrefectures.length === 0
      ) {
        self.selectPopulations.pop();

        // グラフ描写
        self.drawGraph();
        return;
      }

      // 都道府県のチェックが外されたときはselectPopulationsからも消す
      if (new_selectPrefectures.length < old_selectPrefectures.length) {
        // 配列の差分のindexを取得
        const deletePrefectureIndex = old_selectPrefectures.findIndex(
          (i) => new_selectPrefectures.indexOf(i) === -1
        );
        self.selectPopulations.splice(deletePrefectureIndex, 1);

        // グラフ描写
        self.drawGraph();
        return;
      }

      // 新しくチェックした都道府県の総人口を取得(1件のみ)
      axios
        .get(
          "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=" +
            new_selectPrefectures[new_selectPrefectures.length - 1].prefCode,
          {
            headers: {
              "X-API-KEY": APIkey,
            },
          }
        )
        .then(function (response) {
          self.selectPopulations.push({
            prefName:
              new_selectPrefectures[new_selectPrefectures.length - 1].prefName,
            prefPopulation: response.data.result.data[0].data,
          });

          // グラフ描写
          self.drawGraph();
        });
    },
  },
  methods: {
    // グラフ描写のメソッド
    drawGraph: function () {
      var parameters = {
        title: {
          text: "都道府県別の総人口推移グラフ (1960年-2045年)",
        },

        subtitle: {
          text: "Source: RESAS(地域経済分析システム)",
        },

        yAxis: {
          title: {
            text: "総人口数（人）",
          },
        },

        xAxis: {
          categories: [
            1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010,
            2015, 2020, 2025, 2030, 2035, 2040, 2045,
          ],
          title: {
            text: "年度（年）",
          },
        },

        tooltip: {
          valueSuffix: "人",
        },

        legend: {
          layout: "vertical",
          align: "right",
          verticalAlign: "middle",
        },

        plotOptions: {
          series: {
            label: {
              connectorAllowed: false,
            },
          },
        },

        series: [], // グラフ描写用のデータを格納

        // 600px以下の幅の時のデザイン
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 599,
              },
              chartOptions: {
                legend: {
                  layout: "horizontal",
                  align: "center",
                  verticalAlign: "bottom",
                  itemStyle: {
                    fontSize: "8px",
                  },
                },
                title: {
                  style: {
                    fontSize: "12px",
                  },
                },
                subtitle: {
                  style: {
                    fontSize: "10px",
                  },
                },
                yAxis: {
                  title: {
                    style: {
                      fontSize: "10px",
                    },
                  },
                  labels: {
                    style: {
                      fontSize: "8px",
                    },
                  },
                },
                xAxis: {
                  title: {
                    style: {
                      fontSize: "10px",
                    },
                  },
                  labels: {
                    style: {
                      fontSize: "8px",
                    },
                  },
                },
              },
            },
          ],
        },
      };

      // 都道府県とその総人口数をグラフ(series)に格納
      for (let i = 0; i < this.selectPopulations.length; i++) {
        parameters.series.push({
          name: this.selectPopulations[i].prefName,
          data: this.selectPopulations[i].prefPopulation.map(
            (index) => index.value
          ),
        });
      }

      // Highchartsでグラフ描写
      Highcharts.chart("graph", parameters);
    },

    getPrefectures: function () {
      const self = this;
      // 都道府県一覧を取得
      axios
        .get("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
          headers: { "X-API-KEY": APIkey },
        })
        .then(function (response) {
          self.prefectures = response.data.result;
        });
    },
  },
});
app.mount("#app");
