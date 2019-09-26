const Users = require('./db.js');
const fetchBank = async user => {
    const userBank = await Users.findOne({where: {user_id: user.id}})
                ||  await Users.create({
                    user_id: user.id});
    return userBank;
}

module.exports = {
    fetchBank
}