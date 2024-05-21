const SocialNetwork = artifacts.require("SocialNetwork");

module.exports = function(deployer) {
  deployer.deploy(SocialNetwork);
};

//migrations means moving from one place to another
//also updating the state of blockchain