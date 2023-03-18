const Validator = require("../Validator");
const expect = require("chai").expect;

describe("testing-configuration-logging/unit-tests", () => {
  describe("Validator", () => {
    it("If no errors return an empty array", () => {
      const validator = new Validator({
        name: {
          type: "string",
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({ name: "Lorem ipsum eu." });

      expect(errors).to.be.an("array").that.is.empty;
    });

    it("If no options for validation return an empty array", () => {
      const validator = new Validator({});

      const errors = validator.validate({ name: "Lorem ipsum eu." });

      expect(errors).to.be.an("array").that.is.empty;
    });

    it("Checks only the listed fields", () => {
      const validator = new Validator({
        name: {
          type: "string",
          min: 10,
          max: 20,
        },
        age: {
          type: "number",
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({
        name: "Lorem ipsum eu.",
        surname: "Lorem ipsum dolor sit gravida.",
        age: 15,
        height: 165,
      });

      expect(errors).to.be.an("array").that.is.empty;
    });

    describe("Test string property", () => {
      it("Error if type of property is not a string", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({ name: 15 });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").and.to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("expect string, got number");
      });

      it("If type is wrong only one type error expected", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 1,
            max: 5,
          },
        });

        // Check value greater then max
        const errors = validator.validate({ name: 1000000 });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").and.to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("expect string, got number");
      });

      it("Error when length is less than min", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({ name: "Lalala" });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").and.to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("too short, expect 10, got 6");
      });

      it("Error when length is greater than max", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({
          name: "Lorem ipsum dolor sit gravida.",
        });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("too long, expect 20, got 30");
      });
    });

    describe("Test number property", () => {
      it("Error if type of property is not a number", () => {
        const validator = new Validator({
          age: {
            type: "number",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({ age: "15" });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").and.to.be.equal("age");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("expect number, got string");
      });

      it("If type is wrong only one type error expected", () => {
        const validator = new Validator({
          age: {
            type: "number",
            min: 1,
            max: 5,
          },
        });

        // Check value greater then max
        const errors = validator.validate({ age: "1000000" });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").and.to.be.equal("age");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("expect number, got string");
      });

      it("Error when value is less than min", () => {
        const validator = new Validator({
          age: {
            type: "number",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({ age: 5 });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").and.to.be.equal("age");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("too little, expect 10, got 5");
      });

      it("Error when length is greater than max", () => {
        const validator = new Validator({
          age: {
            type: "number",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({ age: 30 });

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property("field").to.be.equal("age");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("too big, expect 20, got 30");
      });
    });

    describe("Test several errors", () => {
      it("Two fields with different type have limit errors", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
          age: {
            type: "number",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({
          name: "Lorem ipsum dolor sit gravida.",
          age: 30,
        });

        expect(errors).to.be.length(2);

        expect(errors[0]).to.have.property("field").to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("too long, expect 20, got 30");

        expect(errors[1]).to.have.property("field").to.be.equal("age");
        expect(errors[1])
          .to.have.property("error")
          .and.to.be.equal("too big, expect 20, got 30");
      });

      it("Two fields with similar type have limit errors", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
          surname: {
            type: "string",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({
          name: "Lorem ipsum dolor sit gravida.",
          surname: "Lorem ipsum dolor sit gravida.",
        });

        expect(errors).to.be.length(2);

        expect(errors[0]).to.have.property("field").to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("too long, expect 20, got 30");

        expect(errors[1]).to.have.property("field").to.be.equal("surname");
        expect(errors[1])
          .to.have.property("error")
          .and.to.be.equal("too long, expect 20, got 30");
      });

      it("First type error and then limit error", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
          age: {
            type: "number",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({
          name: 48,
          age: 30,
        });

        expect(errors).to.be.length(2);

        expect(errors[0]).to.have.property("field").to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("expect string, got number");

        expect(errors[1]).to.have.property("field").to.be.equal("age");
        expect(errors[1])
          .to.have.property("error")
          .and.to.be.equal("too big, expect 20, got 30");
      });

      it("First limit error and then type error", () => {
        const validator = new Validator({
          age: {
            type: "number",
            min: 10,
            max: 20,
          },
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({
          age: 30,
          name: 48,
        });

        expect(errors).to.be.length(2);

        expect(errors[0]).to.have.property("field").to.be.equal("age");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("too big, expect 20, got 30");

        expect(errors[1]).to.have.property("field").to.be.equal("name");
        expect(errors[1])
          .to.have.property("error")
          .and.to.be.equal("expect string, got number");
      });

      it("Two fields with similar type have type errors", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
          surname: {
            type: "string",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({
          name: 48,
          surname: 48,
        });

        expect(errors).to.be.length(2);

        expect(errors[0]).to.have.property("field").to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("expect string, got number");

        expect(errors[1]).to.have.property("field").to.be.equal("surname");
        expect(errors[1])
          .to.have.property("error")
          .and.to.be.equal("expect string, got number");
      });

      it("Two fields with different type have type errors", () => {
        const validator = new Validator({
          name: {
            type: "string",
            min: 10,
            max: 20,
          },
          age: {
            type: "number",
            min: 10,
            max: 20,
          },
        });

        const errors = validator.validate({
          name: 48,
          age: "Lorem ipsum dolor sit gravida.",
        });

        expect(errors).to.be.length(2);

        expect(errors[0]).to.have.property("field").to.be.equal("name");
        expect(errors[0])
          .to.have.property("error")
          .and.to.be.equal("expect string, got number");

        expect(errors[1]).to.have.property("field").to.be.equal("age");
        expect(errors[1])
          .to.have.property("error")
          .and.to.be.equal("expect number, got string");
      });
    });
  });
});
