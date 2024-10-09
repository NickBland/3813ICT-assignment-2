import { app } from "../src/server";

import { before, after } from "mocha";
import { use, expect } from "chai";
import chaiHttp from "chai-http";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

const chai = use(chaiHttp);

describe("Healthcheck", () => {
  let mongoServer: MongoMemoryServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

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
