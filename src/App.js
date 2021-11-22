import contract from './contracts/contract'
import { useState, useEffect } from "react"
import Web3 from "web3";
import { useForm } from "react-hook-form";

// creating object
const initialStatus = {
  connected: false,
  account: null,
  status: null,
  contracts: null,
}
const initialDropState = {
  loading: true,
  list: [],
}
const App = () => {

  const [info, setInfo] = useState(initialStatus);
  const [drops, setDrops] = useState(initialDropState);
  const {
    register,
    handleSubmit,
    // formState: { errors },
  } = useForm();

  const connection = async () => {
    if (window.ethereum) {
      let web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts'
         });
         const networkId = await window.ethereum.request({ 
           method: 'net_version'
          });
          if (networkId == 4) {
            setInfo({
              ...initialStatus,
              connected: true,
              account: accounts[0],
              contracts: new web3.eth.Contract(
                contract.abi,
                contract.address
              )
            })
          }else {
            setInfo ({
              ...initialStatus,
              status: " you are not in rinkyby network"
            })
          }
      } catch (error) {
        setInfo({
          ...initialStatus,
          status: "please check your nework"
        });
        
      }
    }else {
      console.log("pelase install metamask first!")
    }
  }
  console.log(info)
  const updateAccount = async () => {
    if (window.ethereum) {
      window.ethereum.on("changeAccounts", () => {
        window.location.reload();
      })
      window.ethereum.on("chainChanges", () => {
        window.location.reload();
      })
    }
  }

  const getPost = async () => {
    setDrops((prevState) => ({
      ...prevState,
      loading: true,
    }))
    info.contracts.methods.publishPost().call()
    .then((res) => {
      console.log(res);
      setDrops({
        loading: true,
        list: res,
      })
      
    }).catch((err) => {
      console.log(err)
      setDrops(initialDropState);
    })
  }

  const onSubmit = (data) => {
    let newData = {
      imageUri: data.imageUri,
      title: data.title,
      description: data.description,
      approved: false,
    };
    console.log(Object.values(newData))
    info.contracts.methods.addPost(Object.values(newData))
    .send({
      from: info.account
    })
    .then((res) => {
      console.log(res)
      setDrops({
        loading: true,
        list: res,
      })
    }).catch((err) => {
      console.log(err)
      setDrops(initialDropState);
    })
  };

  useEffect(()=> {
    connection();
    updateAccount();
  }, [])

  useEffect(() => {
    if (info.contracts) {
      getPost();
    }
  }, [info])

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Image</label>
        <input {...register("imageUri")} /> {/* register an input */}
        <br />
        <label>Title</label>
        <input {...register("title")} /> {/* register an input */}
        <br />
        <label>Description</label>
        <input {...register("description")} /> {/* register an input */}
        <br />
        <input type="submit" />
      </form>
      <div>
        <button onClick={() => getPost()}> Get Post</button>
        {drops.loading ? <p>loading</p> : null}
        {drops.list.map((item) => {
          return (
            <div>
              <p> Image: {item.imageUri} </p>
              <p> Title: {item.title} </p>
              <p> Description: {item.description} </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App

