app = Vue.createApp({
  data: () => ({
    prefectures: null, // APIから取得した都道府県を格納
    selectPrefectures: [], // チェックした都道府県(prefName)とコード(prefCode)を格納
    selectPopulations: [], // チェックした都道府県(prefName)と総人口(prefPopulation)を格納
  }),
  mounted: function () {
    // 読み込み時にのみ1回だけ都道府県取得APIを呼び出す
    this.getPrefectures();
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
        console.log(self.selectPopulations);
        return;
      }

      // 都道府県のチェックが外されたときはselectPopulationsからも消す
      if (new_selectPrefectures.length < old_selectPrefectures.length) {
        // 配列の差分のindexを取得
        const deletePrefectureIndex = old_selectPrefectures.findIndex(
          (i) => new_selectPrefectures.indexOf(i) === -1
        );
        self.selectPopulations.splice(deletePrefectureIndex, 1);
        console.log(self.selectPopulations);
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
          console.log(self.selectPopulations);
        });
    },
  },
  methods: {
    getPrefectures: function () {
      const self = this;
      // self.prefectures = [
      //   "北海道",
      //   "青森県",
      //   "岩手県",
      //   "宮城県",
      //   "秋田県",
      //   "山形県",
      //   "福島県",
      //   "茨城県",
      //   "栃木県",
      //   "群馬県",
      //   "埼玉県",
      //   "千葉県",
      //   "東京都",
      //   "神奈川県",
      //   "新潟県",
      //   "富山県",
      //   "石川県",
      //   "福井県",
      //   "山梨県",
      //   "長野県",
      //   "岐阜県",
      //   "静岡県",
      //   "愛知県",
      //   "三重県",
      //   "滋賀県",
      //   "京都府",
      //   "大阪府",
      //   "兵庫県",
      //   "奈良県",
      //   "和歌山県",
      //   "鳥取県",
      //   "島根県",
      //   "岡山県",
      //   "広島県",
      //   "山口県",
      //   "徳島県",
      //   "香川県",
      //   "愛媛県",
      //   "高知県",
      //   "福岡県",
      //   "佐賀県",
      //   "長崎県",
      //   "熊本県",
      //   "大分県",
      //   "宮崎県",
      //   "鹿児島県",
      //   "沖縄県",
      // ];
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
