const { assert } = require('chai')
const { default: Web3 } = require('web3')

const SocialNetwork = artifacts.require('./SocialNetwork.sol')

require('chai')
.use(require('chai-as-promised'))
.should()

contract('SocialNetwork', ([deployer, author, tipper]) => { //accounts is an array of all accounts provided to us by ganache
    let socialNetwork

    before(async () => {
        //assigned value to var to use it everywhere as instance
        //prevents duplication
        socialNetwork = await SocialNetwork.deployed()
    })

    describe('deployement', async () => {
        it('deploys successfully', async () => {
            //to use 'await' need to call in async function (as above)
            const address = await socialNetwork.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        
        it('has a name', async() => {
            const name = await socialNetwork.name()
            assert.equal(name, 'Amity University Social Network')    
        })
    })

    describe('posts', async () => {
        let result, postCount
        
        before(async () => {
            result = await socialNetwork.createPost('This is my first post', {from: author})
            postCount = await socialNetwork.postCount()
        })

        it('creates posts', async () => {
            //SUCCESS
            assert.equal(postCount,1)
            const event =  result.logs[0].args
            //console.log(event) //to display data in terminal gathered from event to check
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correrct')
            assert.equal(event.content, 'This is my first post', 'content is correct')
            assert.equal(event.tipAmount, '0', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')
            
            //FAILURE: Post must have content
            await socialNetwork.createPost('', { from: author }).should.be.rejected; //no empty posts
        })
        
        it('lists posts', async () => {
            const post = await socialNetwork.posts(postCount)
            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correrct')
            assert.equal(post.content, 'This is my first post', 'content is correct')
            assert.equal(post.tipAmount, '0', 'tip amount is correct')
            assert.equal(post.author, author, 'author is correct')

        })

        it('allows users to tip posts', async () => {
            //Track the author balance before purchase
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance) //converting it into BigNumber
            
            result = await socialNetwork.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1','Ether') }) //convert 1 Ether to Wei
            
            //SUCCESS
            assert.equal(postCount,1)
            const event =  result.logs[0].args
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correrct')
            assert.equal(event.content, 'This is my first post', 'content is correct')
            assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')  
        
            //Check that author recieved funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            let tipAmount
            tipAmount = web3.utils.toWei('1','Ether')
            tipAmount = new web3.utils.BN(tipAmount)

            const expectedBalance = oldAuthorBalance.add(tipAmount)
            
            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

            //FAILURE: Tries to tip a post that does not exist
            //Ensuring a valid id is passed in whenever the TipPost function is called 
            await socialNetwork.tipPost(99, { from: tipper, value: web3.utils.toWei('1', "Ether")}).should.be.rejected;
        })
  
    })
})
