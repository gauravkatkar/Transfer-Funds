import {useEffect,useState} from 'react'
import Web3 from 'web3';
import './App.css';
import detectEthereumProvider from '@metamask/detect-provider'
import {loadContract} from "./utils/load-contract"

function App() {

  const [web3Api,setWeb3Api] = useState({
    provider :null,
    web3: null,
    contract: null
  })

  const [account,setAccount] = useState(null); //get account detail
  const [balance,setBalance] = useState(null); //show balance    
  const [reload,shouldReload] = useState(null); //reload auto      

  const reloadEffect = ()=> shouldReload(!reload);
  //opening the metamask directly 
  useEffect(()=> {
    const loadProvider = async() =>{
      const provider= await detectEthereumProvider();
      const contract = await loadContract("transfer", provider);
      if(provider){
        provider.request({method: "eth_requestAccounts"});
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })
      }
      else {
        console.error("Please install meta mask");
      }
      //without using metamask provider
      // if(window.ethereum){
      //   provider = window.ethereum;
      //   try{
      //     await provider.enable();
      //   }
      //   catch{
      //     console.error("User not allowed");
      //   }
      // } else if (window.web3){
      //   provider = window.web3.currentProvider;
      // }else if (!process.env.production){
      //   provider = new Web3.provider.HttpProvider("https://localhost:7545");
      // } 
      //Without using detectmetamask provider

    
    };

    loadProvider();
  },[]);

  // Set balance to react by fetching it from smart contract
  useEffect(()=>{
    const loadBalance = async()=>{
      const {contract,web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance,"ether"));
    };

    web3Api.contract && loadBalance();

  }, [web3Api,reload])

  //Use to transfer fund 
  const transferFund = async()=>{
    const {web3,contract} = web3Api;
    await contract.trans({
      from:account,
      value:web3.utils.toWei("2","ether"),
    });
    reloadEffect();
  }

  //to withdraw funds from account
const WithdrawFund = async()=>{
  const {contract, web3} = web3Api;
  const withdrawAmount = web3.utils.toWei("1", "ether");
  await contract.withDraw(withdrawAmount,{
    from: account,
  })
  reloadEffect();
}
  //fetching account using web3Api
  useEffect(() =>{
    const getAccount = async()=>{
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccount()
  },[web3Api.web3]);

  return (
    
    
    <>
      <div class="card text-center">
        <div class="card-header">Funding</div>
        <div class="card-body">
          <h5 class="card-title">Balance: {balance} ETH </h5>
          <p class="card-text">
            Account : {account ? account :"Not Connected "}
          </p>
          {/* <button
            type="button"  class="btn btn-success"
            onClick={async() => {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
                
              });
              console.log(accounts);
            }}
          >
            Connect to metamask
          </button> */}
          &nbsp;
          <button type="button" class="btn btn-success " onClick={transferFund}>
            Transfer
          </button>
          &nbsp;
          <button type="button" class="btn btn-primary " onClick = {WithdrawFund}>
            Withdraw
          </button>
        </div>
        <div class="card-footer text-muted">Gaurav Katkar</div>
      </div>
    </>
  );
}

export default App;
