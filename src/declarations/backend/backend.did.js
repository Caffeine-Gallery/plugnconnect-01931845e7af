export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getAttendees' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'registerAttendance' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
