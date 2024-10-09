import { app } from "../src/server";

import { before } from "mocha";

import { use, expect } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

describe("Channels", () => {
  let authToken: string;

  before(async () => {
    // Get an authToken to use in the tests, this can be done by calling the /api/user/login endpoint
    const res = await chai.request(app).post("/api/user/login").send({
      username: "super",
      password: "123",
    });

    authToken = res.body.authToken;
  });

  describe("GET All channels", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/channels/0")
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
          .get("/api/channels/0")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });
  });

  describe("GET Single Channel", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/channel/1")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("object");
            done();
          });
      });
    });

    describe("Unknown Channel", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .get("/api/channel/999")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("GET All Group Channels", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/channels/1")
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
          .get("/api/channels/1")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Invalid Group ID", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .get("/api/channels/999")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("POST Create Channel", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 201 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/1")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "new channel",
            description: "new channel description",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(201);
            expect(res.body).to.have.property("channel");
            done();
          });
      });
    });

    describe("With Invalid Input", () => {
      it("should return a 400 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/1")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "new channel",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(400);
            done();
          });
      });
    });

    describe("With Invalid Group ID", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/999")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "new channel",
            description: "new channel description",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("Duplicate Channel Name", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/1")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "new channel",
            description: "new channel description",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });
  });

  describe("PUT Update Channel", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .put("/api/channel/1")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "new channel name",
            description: "new channel description",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property("channel");
            done();
          });
      });
    });

    describe("Unknown Channel", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .put("/api/channel/999")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "new channel name",
            description: "new channel description",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("Duplicate Channel Name", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .put("/api/channel/1")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "new channel name",
            description: "new channel description",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });
  });

  describe("POST Add User to Channel", () => {
    const testUsername = "newuserchannels";

    before(async () => {
      // Create a new user to add to the channel
      await chai
        .request(app)
        .post("/api/user")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          username: testUsername,
          password: "123",
          name: "New User",
          email: "new@userchannels.com",
          roles: [],
          groups: [],
        });
    });

    after(() => {
      console.log("----------------------------------------");
    });

    describe("With Valid Auth", () => {
      it("should return a 201 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/1/joe") // Joe is in DB already and is a part of the group
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(201);
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/1/" + testUsername)
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Unknown Channel", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/999/" + testUsername)
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("User Not In Group", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/1/" + testUsername)
          .set("Authorization", `Bearer ${authToken}`)
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
          .post("/api/channel/1/thisuserdoesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("User Already in Channel", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .post("/api/channel/1/joe")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });
  });

  describe("GET User In Channel", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/channel/1/joe")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("boolean");
            done();
          });
      });
    });

    describe("User Not In Channel", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/channel/1/newuserchannels")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("boolean");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .get("/api/channel/1/joe")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Unknown Channel", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .get("/api/channel/999/joe")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("Unknown User", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .get("/api/channel/1/thisuserdoesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("DELETE User From Channel", () => {
    after(() => {
      console.log("----------------------------------------");
    });

    describe("Unknown Channel", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .delete("/api/channel/999/joe")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("Unknown User", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .delete("/api/channel/1/thisuserdoesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("User Not In Channel", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .delete("/api/channel/1/newuserchannels")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("User Not In Group", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .delete("/api/channel/1/newuserchannels")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("Delete User From Channel", () => {
      it("should return a 204 status", (done) => {
        chai
          .request(app)
          .delete("/api/channel/1/joe")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            done();
          });
      });
    });
  });
});
