import Text "mo:base/Text";

actor {
    // Simple ping function to test connectivity
    public query func ping() : async Text {
        return "Connected to backend!";
    };
}
