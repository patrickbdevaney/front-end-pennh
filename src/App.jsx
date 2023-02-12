import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    Spacer,
    IconButton,
    Image,
    CircularProgress,
    ThemeProvider,
    theme,
    ColorModeProvider,
    CSSReset,
    Input,
    SimpleGrid,
    Text,
  } from '@chakra-ui/react';
  
  import { Alchemy, Network, Utils } from 'alchemy-sdk';
  import { ethers } from 'ethers';
  import { useEffect, useState } from 'react';
  
  
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  
  function App() {
    const [userAddress, setUserAddress] = useState('');
    const [account, setAccount] = useState();
    const [results, setResults] = useState([]);
    const [hasQueried, setHasQueried] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [tokenDataObjects, setTokenDataObjects] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");
    const [nameid,setName] = useState();
  
  
    
    useEffect(() => {
      getCurrentWalletConnected();
      addWalletListener();
    }, [walletAddress]);
  
    const connectWallet = async () => {
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        try {
          /* MetaMask is installed */
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setWalletAddress(accounts[0]);
          setUserAddress(accounts[0]);
          console.log(accounts[0]);
        } catch (err) {
          console.error(err.message);
        }
      } else {
        /* MetaMask is not installed */
        console.log("Please install MetaMask");
      }
    };
  
    const getCurrentWalletConnected = async () => {
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setUserAddress(accounts[0]);
            console.log(accounts[0]);
          } else {
            console.log("Connect to MetaMask using the Connect button");
          }
        } catch (err) {
          console.error(err.message);
        }
      } else {
        /* MetaMask is not installed */
        console.log("Please install MetaMask");
      }
    };
  
    const addWalletListener = async () => {
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        window.ethereum.on("accountsChanged", (accounts) => {
          setWalletAddress(accounts[0]);
          setUserAddress(accounts[0]);
          console.log(accounts[0]);
        });
      } else {
        /* MetaMask is not installed */
        setWalletAddress("");
        console.log("Please install MetaMask");
      }
    };
  
    async function getinfo(x) {
      setUserAddress(x);
      const name=await provider.lookupAddress(userAddress);
      setName[name];
    }
  
  
    async function getNftsForOwner() {
      setisLoading(true);
      const config = {
        apiKey: 'Se-7teMwhagj9USE3mjDZk5fH2mcJqXs',
        network: Network.ETH_GOERLI,
      };
  
      const alchemy = new Alchemy(config);
      const data = await alchemy.nft.getNftsForOwner(userAddress);
  
  
      setResults(data);
  
      const tokenDataPromises = [];
  
      for (let i = 0; i < data.ownedNfts.length; i++) {
        const tokenData = alchemy.nft.getNftMetadata(
          data.ownedNfts[i].contract.address,
          data.ownedNfts[i].tokenId
        );
        tokenDataPromises.push(tokenData);
      }
  
      setTokenDataObjects(await Promise.all(tokenDataPromises));
      setHasQueried(true);
      setisLoading(false);
    }
  
    return (
        <Box w="100vw" textAlign="right" py={4} mr={12}>
        <Center>
          <Flex
            alignItems={'center'}
            justifyContent="center"
            flexDirection={'column'}
          >
            <Heading mb={0} fontSize={36}>
                Badge Token Indexer
            </Heading>
            <Text>
              Plug in an address and this website will return all of its Badge
              token balances!
            </Text>
          </Flex>
        </Center>
        <Flex
          w="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent={'center'}
        >
          <Heading mt={42}>
            Get all the Badge tokens of this address:
          </Heading>
          <Text mb='8px'>Value: {nameid}</Text>
          <Input
            value={userAddress}
            onChange={(e) => {getinfo(e.target.value)}}
            color="black"
            w="600px"
            textAlign="center"
            p={4}
            bgColor="white"
            fontSize={24} />
          <Button fontSize={20} size='sm'
            onClick={connectWallet} mt={36} bgColor="blue">
            {walletAddress && walletAddress.length > 0
              ? `Connected: ${walletAddress.substring(
                0,
                6
              )}...${walletAddress.substring(38)}`
              : "Connect Wallet"}
          </Button>
  
          <Button fontSize={20} onClick={getNftsForOwner} mt={24} bgColor="blue">
            {isLoading ? (
            <CircularProgress isIndeterminate size="24px" color="teal" />
            ) : (
              'Check ERC-20 Token Balances')}
          </Button>
  
          <Heading my={36}>Badge token balances:</Heading>
  
          {hasQueried ? (
            <SimpleGrid w={'90vw'} columns={4} spacing={24}>
              {results.ownedNfts.map((e, i) => {
                return (
                  <Flex
                    flexDir={'column'}
                    color="white"
                    bg="blue"
                    w={'20vw'}
                    key={e.id}
                  >
                    <Box>
                      <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                    </Box>
                    <Image src={tokenDataObjects[i].rawMetadata.image} />
                  </Flex>
                );
              })}
            </SimpleGrid>
          ) : (
            'Please make a query! This may take a few seconds...'
          )}
        </Flex>
      </Box>
    );
  }
  
  export default App;
  