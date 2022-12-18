Summary
 - [divide-before-multiply](#divide-before-multiply) (1 results) (Medium)
 - [timestamp](#timestamp) (1 results) (Low)
 - [costly-loop](#costly-loop) (1 results) (Informational)
 - [solc-version](#solc-version) (3 results) (Informational)
 - [low-level-calls](#low-level-calls) (1 results) (Informational)
## divide-before-multiply
Impact: Medium
Confidence: Medium
 - [ ] ID-0
[CircuitBreaker.calculateChange(int256)](contracts/CircuitBreaker.sol#L224-L238) performs a multiplication on the result of a division:
	-[percentageChange = ((price - currentPrice) / currentPrice) * 100](contracts/CircuitBreaker.sol#L229)

contracts/CircuitBreaker.sol#L224-L238


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-1
[CircuitBreaker.checkStaleness(uint256)](contracts/CircuitBreaker.sol#L206-L215) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp - timeStamp > interval](contracts/CircuitBreaker.sol#L211)

contracts/CircuitBreaker.sol#L206-L215


## costly-loop
Impact: Informational
Confidence: Medium
 - [ ] ID-2
[CircuitBreaker.deleteEventType(uint8[])](contracts/CircuitBreaker.sol#L111-L121) has costly operations inside a loop:
	- [configuredEvents.pop()](contracts/CircuitBreaker.sol#L117)

contracts/CircuitBreaker.sol#L111-L121


## solc-version
Impact: Informational
Confidence: High
 - [ ] ID-3
Pragma version[>=0.8.17](contracts/CircuitBreaker.sol#L2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.7

contracts/CircuitBreaker.sol#L2


 - [ ] ID-4
solc-0.8.17 is not recommended for deployment

 - [ ] ID-5
Pragma version[>=0.8.17](contracts/test/CustomMock.sol#L2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.7

contracts/test/CustomMock.sol#L2


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-6
Low level call in [CircuitBreaker.customFunction()](contracts/CircuitBreaker.sol#L275-L278):
	- [(ok) = externalContract.call(functionSelector)](contracts/CircuitBreaker.sol#L276)

contracts/CircuitBreaker.sol#L275-L278


