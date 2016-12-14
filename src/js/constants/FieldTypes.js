const number = ['Long', 'Double', 'Short'];
// const types = [];
const user_types = ['Money'];

export function forSum (field) {
  return user_types.indexOf(field.user_type) > -1 ||
        (number.indexOf(field.type) > -1 && !field.user_type);
};
