import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pg from "pg";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

var client = new pg.Client(process.env.DATABASE_URL);

client.connect(function (err) {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
});

app.get("/api", (req, res) => {
  client.query(
    `SELECT distinct "NFT_NAME" from public."NFT";`,
    function (err, results) {
      const NFTNames = results.rows.map((result) => {
        return result.NFT_NAME;
      });
      res.send(NFTNames);
    }
  );
});

app.get("/api/nft_date", (req, res) => {
  const { NFTName } = req.query;
  //console.log(NFTName);
  client.query(
    `SELECT MAX("NFT_TIME"),MIN("NFT_TIME") FROM public."NFT" WHERE "NFT_NAME"='${NFTName}';`,
    function (err, results) {
      //console.log(results.rows);
      res.send({
        startTime: new Date(results.rows[0].min * 1000).toDateString(),
        endTime: new Date(results.rows[0].max * 1000).toDateString(),
      });
    }
  );
});

app.get("/api/nft_data", (req, res) => {
  const { NFTName, startDate, endDate } = req.query;

  client.query(
    `SELECT "NFT_TIME","NFT_PRICE" FROM public."NFT" WHERE "NFT_NAME"='${NFTName}' AND "NFT_TIME" BETWEEN ${startDate} AND ${endDate} ORDER BY "NFT_TIME";`,
    function (err, results) {
      //console.log(results);
      const NFT_TIME = [],
        NFT_PRICE = [];
      results.rows.forEach((result) => {
        NFT_TIME.push(
          new Date(result.NFT_TIME * 1000).toDateString() +
            " " +
            new Date(result.NFT_TIME * 1000).toLocaleTimeString()
        );
        NFT_PRICE.push(result.NFT_PRICE);
      });
      res.send({ NFT_TIME: NFT_TIME, NFT_PRICE: NFT_PRICE });
    }
  );
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
