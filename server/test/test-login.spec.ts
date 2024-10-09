import { app } from "../src/server";

import { use, expect } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

describe("Login", () => {

  describe("POST Login Correct Password", () => {
    it("should return a 200 status", (done) => {
      chai
        .request(app)
        .post("/api/user/login")
        .send({
          username: "super",
          password: "123",
        })
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.have.property("authToken");
          expect(res.body).to.not.have.property("password");
          done();
        });
    });
  });

  describe("POST Login Incorrect Password", () => {
    it("should return a 401 status", (done) => {
      chai
        .request(app)
        .post("/api/user/login")
        .send({
          username: "super",
          password: "1234",
        })
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          done();
        });
    });
  });

  describe("POST Login Incorrect Username", () => {
    it("should return a 401 status", (done) => {
      chai
        .request(app)
        .post("/api/user/login")
        .send({
          username: "superman",
          password: "123",
        })
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          done();
        });
    });
  });

  describe("POST Login No Username", () => {
    it("should return a 400 status", (done) => {
      chai
        .request(app)
        .post("/api/user/login")
        .send({
          password: "123",
        })
        .end((err, res) => {
          expect(res.status).to.be.equal(400);
          done();
        });
    });
  });
});
