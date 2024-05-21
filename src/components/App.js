import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json'
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  async componentWillMount(){
    await this.loadWeb3() //load the function
    await this.loadBlockchainData()
  }

  async loadWeb3(){ //code provided by Metamask as the best manner to connect with App
    if(window.ethereum){ //looks for a ethereum provider
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3){ //if not found creates a new one using web3
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Non-Ethereum browser detected. You should consider trying Metamask!')
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3
    //load account
    const accounts = await web3.eth.getAccounts() //returns an array of connected accounts
    console.log(accounts)
    this.setState({ account: accounts[0]})
    //Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[networkId] //to use networkId to fetch all of its data from 'Networks'
    if(networkData){ //if data exists 
      console.log(networkId)
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address) //instance of smart contract
      this.setState({ socialNetwork }) //key and value of same name, es6
      const postCount = await socialNetwork.methods.postCount().call() //.call() used to call the function, does not cost any gas
      this.setState({ postCount })
      //Load Posts
      for(var i = 1; i<= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post] //creates a new array and adds the new post at the end of the array
        })
      }
      //Sort posts. Show highest tipped posts first
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount) //sorting posts on the basis of tipAmount
      })
      this.setState({ loading: false })
      //console.log({ posts: this.state.posts })
    }
    else{
      window.alert('SocialNetwork contract not deployed to detected network.')
    }
    
    //Address
    //ABI
  }

  createPost(content){ //Accessing createPost function from Smart Contract using instance created earlier
    this.setState({ loading: true })
    this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account }) //Active meta-mask account
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })  
    
  }
  
  tipPost(id, tipAmount){ //Accessing tipPost function from Smart Contract
    this.setState({ loading: true })
    this.state.socialNetwork.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  constructor(props){ //props is properties of component
    super(props)
    this.state = { 
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true
    }
    this.createPost = this.createPost.bind(this) //to access this function
    this.tipPost = this.tipPost.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account = {this.state.account}/> 
        { this.state.loading
          ? <div id="loader" className='text-center mt-5'><p>Loading...</p></div>
          : <Main 
              posts={this.state.posts}
              createPost={this.createPost}
              tipPost={this.tipPost}
            />
        }
      </div>
    );
  }
}

export default App;
