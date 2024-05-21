const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};

//migrations means moving from one place to another
//also updating the state of blockchain