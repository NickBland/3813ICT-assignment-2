import { app } from "../src/server";

import { use, expect } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

describe("Healthcheck", () => {
  describe("GET Healthcheck", () => {
    it("should return a 200 status", (done) => {
      chai
        .request(app)
        .get("/healthcheck")
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          done();
        });
    });
  });
});
