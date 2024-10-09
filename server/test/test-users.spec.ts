import { app } from "../src/server";

import { before } from "mocha";

import { use, expect } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

describe("Users", () => {
  let authToken: string;

  before(async () => {
    // Get an authToken to use in the tests, this can be done by calling the /api/user/login endpoint
    const res = await chai.request(app).post("/api/user/login").send({
      username: "super",
      password: "123",
    });

    authToken = res.body.authToken;
  });

  describe("GET All users", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/user")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("array");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .get("/api/user")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });
  });

  describe("GET Single User", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/user/super")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property("username");
            expect(res.body).to.not.have.property("password");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .get("/api/user/super")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("With Invalid Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .get("/api/user/super")
          .set("Authorization", `Bearer invalid`)
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            expect(res.body.message).to.be.equal("Invalid Token");
            done();
          });
      });
    });

    describe("User That Does Not Exist", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .get("/api/user/doesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("POST Create New User", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("Valid User", () => {
      it("should return a 201 status", (done) => {
        chai
          .request(app)
          .post("/api/user")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            username: "newuser",
            name: "New User",
            password: "123",
            email: "new@user.com",
            roles: [],
            groups: [],
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(201);
            expect(res.body).to.have.property("username");
            expect(res.body).to.not.have.property("password");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .post("/api/user")
          .send({
            username: "newuser",
            name: "New User",
            password: "123",
            email: "new@user.com",
            roles: [],
            groups: [],
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Duplicate User (username)", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .post("/api/user")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            username: "newuser",
            name: "New User",
            password: "123",
            email: "something@different.com",
            roles: [],
            groups: [],
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });

    describe("Duplicate User (email)", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .post("/api/user")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            username: "IamUnique",
            name: "New User",
            password: "123",
            email: "new@user.com",
            roles: [],
            groups: [],
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });

    describe("Invalid User (only username)", () => {
      it("should return a 400 status", (done) => {
        chai
          .request(app)
          .post("/api/user")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            username: "IamUnique",
            roles: [],
            groups: [],
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(400);
            done();
          });
      });
    });
  });

  describe("PUT Update User", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("Valid Update (just name)", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .put("/api/user/super")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "super user new",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property("username");
            expect(res.body).to.have.property("name");
            expect(res.body.name).to.be.equal("super user new");
            done();
          });
      });
    });

    describe("Invalid update (duplicate email)", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .put("/api/user/super")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            email: "new@user.com",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });

    describe("Edit Other User", () => {
      it("should return a 403 status", (done) => {
        chai
          .request(app)
          .put("/api/user/newuser")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            email: "new@user.com",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(403);
            done();
          });
      });
    });

    describe("Edit Unknown User", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .put("/api/user/thisuserdoesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            email: "new@user.com",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("DELETE User", () => {
    let newUserAuthToken: string;

    before(async () => {
      const res = await chai.request(app).post("/api/user/login").send({
        username: "newuser",
        password: "123",
      });

      newUserAuthToken = res.body.authToken;
    });

    after(() => {
      console.log("----------------------------------------");
    });
    describe("Delete Other User", () => {
      it("should return a 403 status", (done) => {
        chai
          .request(app)
          .delete("/api/user/super")
          .set("Authorization", `Bearer ${newUserAuthToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(403);
            done();
          });
      });
    });

    describe("Valid Delete", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .delete("/api/user/newuser")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            done();
          });
      });
    });

    describe("Delete Unknown User", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .delete("/api/user/thisuserdoesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("PATCH Update Token", () => {
    before(async () => {
      // Recreate deleted newuser
      await chai
        .request(app)
        .post("/api/user")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          username: "newuser",
          name: "New User",
          password: "123",
          email: "new@user.com",
          roles: [],
          groups: [],
        });
    });

    after(() => {
      console.log("----------------------------------------");
    });
    describe("Valid Update", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .patch("/api/user/refresh")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            username: "super",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property("authToken");
            done();
          });
      });
    });

    describe("Invalid Update", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .patch("/api/user/refresh")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            username: "newuser",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(403);
            done();
          });
      });
    });

    describe("Unknown User", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .patch("/api/user/refresh")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            username: "thisuserdoesnotexist",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });
});
