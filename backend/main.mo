import Bool "mo:base/Bool";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor {
    private stable var attendeesEntries : [(Principal, (Text, Nat))] = [];
    private var attendees = HashMap.HashMap<Principal, (Text, Nat)>(0, Principal.equal, Principal.hash);

    public shared(msg) func registerAttendance(name : Text, guestCount : Nat) : async Bool {
        let caller = msg.caller;
        attendees.put(caller, (name, guestCount));
        return true;
    };

    public query func getAttendees() : async [(Text, Nat)] {
        let values = Iter.toArray(attendees.vals());
        return values;
    };

    system func preupgrade() {
        attendeesEntries := Iter.toArray(attendees.entries());
    };

    system func postupgrade() {
        attendees := HashMap.fromIter<Principal, (Text, Nat)>(attendeesEntries.vals(), 0, Principal.equal, Principal.hash);
        attendeesEntries := [];
    };
}
