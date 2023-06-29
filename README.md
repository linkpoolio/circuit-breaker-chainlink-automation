# Circuit Breaker | Chainlink Automation

## I. About

The Circuit Breaker contract is a highly configurable proof of concept that can be used with any OCR price feed. It is capable of emitting events or calling custom functions based on predefined conditions, and it comes with an interactive UI that allows users to easily configure and manage the contract.

## II. Pre-requisites

### 1. Setup Wallet

- Install any wallet to your browser (Metamask, etc.)

### 2. Setup Ganache

- Install ganache client locally
- Run ganache
- Confirm test eth on ganache account
- Set metamask to ganache network

## III. Local Setup

### 1. Clone repo

```
$ git clone git@github.com:linkpoolio/circuit-breaker-chainlink-automation.git
```

### 2. Setup .env file

```
# from /root
$ echo "NETWORK=hardhat" >> .env
$ echo "LOCAL_RPC_URL=\"http://127.0.0.1:7545\"" >> .env
$ echo "MAINNET_RPC_URL=\"https://eth.llamarpc.com\"" >> .env
```

### 3. Deploy contract

```
# from /root
$ make deploy
```

### 4. Install UI dependencies

```
# from /root/ui
$ npm i
```

## IV. Run the App

### 1. Run storybook

```
# from /root/ui
$ npm storybook
```

### 2. View app

- Open browser at [localhost:9009](localhost:9009)

## V. Testing

### 1. Test Contracts

```bash
# from root
$ make test-contracts
```

### 2. Check test coverage

```bash
# from root
$ make coverage
```
