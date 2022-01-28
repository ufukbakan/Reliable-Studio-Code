const { encode, decode } = require("../renderer-operations/encoderDecoder");
const encoded = encode("This code definetly works", "MySecretKey");

test("Encoding test", () => {
    expect(encoded.length).toBeGreaterThan("This code definetly works".length);
    expect(encoded).toEqual(expect.not.stringContaining("This code definetly works"));
});

test("Decoding test", () => {
    expect(() => decode(encoded)).toThrow("You are missing the secret key");
    expect(() => decode(encoded, "MySecretKe")).toThrow("Secret key was incorrect, or encoded input was malformed.");
    expect(decode(encoded, "MySecretKey")).toEqual("This code definetly works");
});
