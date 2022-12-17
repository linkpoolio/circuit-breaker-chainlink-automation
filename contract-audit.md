Summary
 - [divide-before-multiply](#divide-before-multiply) (1 results) (Medium)
 - [unchecked-lowlevel](#unchecked-lowlevel) (1 results) (Medium)
 - [uninitialized-local](#uninitialized-local) (2 results) (Medium)
 - [events-maths](#events-maths) (3 results) (Low)
 - [missing-zero-check](#missing-zero-check) (1 results) (Low)
 - [variable-scope](#variable-scope) (2 results) (Low)
 - [timestamp](#timestamp) (1 results) (Low)
 - [costly-loop](#costly-loop) (1 results) (Informational)
 - [solc-version](#solc-version) (3 results) (Informational)
 - [low-level-calls](#low-level-calls) (1 results) (Informational)
 - [naming-convention](#naming-convention) (16 results) (Informational)
 - [constable-states](#constable-states) (1 results) (Optimization)
## divide-before-multiply
Impact: Medium
Confidence: Medium
 - [ ] ID-0
[CircuitBreaker.calculateChange(int256)](contracts/CircuitBreaker.sol#L203-L217) performs a multiplication on the result of a division:
	- [percentageChange = ((price - currentPrice) / currentPrice) * 100](contracts/CircuitBreaker.sol#L208)

contracts/CircuitBreaker.sol#L203-L217


## unchecked-lowlevel
Impact: Medium
Confidence: Medium
 - [ ] ID-1
[CircuitBreaker.customFunction()](contracts/CircuitBreaker.sol#L254-L256) ignores return value by [externalContract.call(functionSelector)](contracts/CircuitBreaker.sol#L255)

contracts/CircuitBreaker.sol#L254-L256


## uninitialized-local
Impact: Medium
Confidence: Medium
 - [ ] ID-2
[CircuitBreaker.checkEvents(int256,uint256).e_scope_0](contracts/CircuitBreaker.sol#L234) is a local variable never initialized

contracts/CircuitBreaker.sol#L234


 - [ ] ID-3
[CircuitBreaker.checkEvents(int256,uint256).e_scope_1](contracts/CircuitBreaker.sol#L239) is a local variable never initialized

contracts/CircuitBreaker.sol#L239


## events-maths
Impact: Low
Confidence: Medium
 - [ ] ID-4
[CircuitBreaker.setLimit(int256)](contracts/CircuitBreaker.sol#L115-L117) should emit an event for: 
	- [limit = _limit](contracts/CircuitBreaker.sol#L116) 

contracts/CircuitBreaker.sol#L115-L117


 - [ ] ID-5
[CircuitBreaker.setVolatility(int256,int8)](contracts/CircuitBreaker.sol#L132-L138) should emit an event for: 
	- [currentPrice = _currentPrice](contracts/CircuitBreaker.sol#L136) 
	- [volatilityPercentage = _percentage](contracts/CircuitBreaker.sol#L137) 

contracts/CircuitBreaker.sol#L132-L138


 - [ ] ID-6
[CircuitBreaker.setStaleness(uint256)](contracts/CircuitBreaker.sol#L123-L125) should emit an event for: 
	- [interval = _interval](contracts/CircuitBreaker.sol#L124) 

contracts/CircuitBreaker.sol#L123-L125


## missing-zero-check
Impact: Low
Confidence: Medium
 - [ ] ID-7
[CircuitBreaker.setCustomFunction(address,bytes)._externalContract](contracts/CircuitBreaker.sol#L264) lacks a zero-check on :
		- [externalContract = _externalContract](contracts/CircuitBreaker.sol#L267)

contracts/CircuitBreaker.sol#L264


## variable-scope
Impact: Low
Confidence: High
 - [ ] ID-8
Variable '[CircuitBreaker.checkEvents(int256,uint256).e](contracts/CircuitBreaker.sol#L229)' in [CircuitBreaker.checkEvents(int256,uint256)](contracts/CircuitBreaker.sol#L219-L249) potentially used before declaration: [(s,e) = checkStaleness(_timeStamp)](contracts/CircuitBreaker.sol#L234)

contracts/CircuitBreaker.sol#L229


 - [ ] ID-9
Variable '[CircuitBreaker.checkEvents(int256,uint256).e](contracts/CircuitBreaker.sol#L229)' in [CircuitBreaker.checkEvents(int256,uint256)](contracts/CircuitBreaker.sol#L219-L249) potentially used before declaration: [(l,e) = checkLimit(_price)](contracts/CircuitBreaker.sol#L239)

contracts/CircuitBreaker.sol#L229


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-10
[CircuitBreaker.checkStaleness(uint256)](contracts/CircuitBreaker.sol#L185-L194) uses timestamp for comparisons
	Dangerous comparisons:
	- [block.timestamp - _timeStamp > interval](contracts/CircuitBreaker.sol#L190)

contracts/CircuitBreaker.sol#L185-L194


## costly-loop
Impact: Informational
Confidence: Medium
 - [ ] ID-11
[CircuitBreaker.deleteEventType(uint8)](contracts/CircuitBreaker.sol#L99-L109) has costly operations inside a loop:
	- [configuredEvents.pop()](contracts/CircuitBreaker.sol#L105)

contracts/CircuitBreaker.sol#L99-L109


## solc-version
Impact: Informational
Confidence: High
 - [ ] ID-12
Pragma version[>=0.8.17](contracts/CircuitBreaker.sol#L2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16

contracts/CircuitBreaker.sol#L2


 - [ ] ID-13
solc-0.8.17 is not recommended for deployment

 - [ ] ID-14
Pragma version[>=0.8.17](contracts/test/CustomMock.sol#L2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16

contracts/test/CustomMock.sol#L2


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-15
Low level call in [CircuitBreaker.customFunction()](contracts/CircuitBreaker.sol#L254-L256):
	- [externalContract.call(functionSelector)](contracts/CircuitBreaker.sol#L255)

contracts/CircuitBreaker.sol#L254-L256


## naming-convention
Impact: Informational
Confidence: High
 - [ ] ID-16
Parameter [CircuitBreaker.setVolatility(int256,int8)._currentPrice](contracts/CircuitBreaker.sol#L132) is not in mixedCase

contracts/CircuitBreaker.sol#L132


 - [ ] ID-17
Parameter [CircuitBreaker.addEventType(uint8)._eventType](contracts/CircuitBreaker.sol#L85) is not in mixedCase

contracts/CircuitBreaker.sol#L85


 - [ ] ID-18
Parameter [CircuitBreaker.checkVolatility(int256)._price](contracts/CircuitBreaker.sol#L168) is not in mixedCase

contracts/CircuitBreaker.sol#L168


 - [ ] ID-19
Parameter [CircuitBreaker.deleteEventType(uint8)._eventType](contracts/CircuitBreaker.sol#L99) is not in mixedCase

contracts/CircuitBreaker.sol#L99


 - [ ] ID-20
Parameter [CircuitBreaker.checkStaleness(uint256)._timeStamp](contracts/CircuitBreaker.sol#L185) is not in mixedCase

contracts/CircuitBreaker.sol#L185


 - [ ] ID-21
Parameter [CircuitBreaker.setCustomFunction(address,bytes)._functionSelector](contracts/CircuitBreaker.sol#L265) is not in mixedCase

contracts/CircuitBreaker.sol#L265


 - [ ] ID-22
Parameter [CircuitBreaker.updateFeed(address)._feed](contracts/CircuitBreaker.sol#L144) is not in mixedCase

contracts/CircuitBreaker.sol#L144


 - [ ] ID-23
Parameter [CircuitBreaker.checkEvents(int256,uint256)._price](contracts/CircuitBreaker.sol#L219) is not in mixedCase

contracts/CircuitBreaker.sol#L219


 - [ ] ID-24
Parameter [CircuitBreaker.checkLimit(int256)._price](contracts/CircuitBreaker.sol#L196) is not in mixedCase

contracts/CircuitBreaker.sol#L196


 - [ ] ID-25
Parameter [CircuitBreaker.checkEvents(int256,uint256)._timeStamp](contracts/CircuitBreaker.sol#L219) is not in mixedCase

contracts/CircuitBreaker.sol#L219


 - [ ] ID-26
Parameter [CircuitBreaker.setLimit(int256)._limit](contracts/CircuitBreaker.sol#L115) is not in mixedCase

contracts/CircuitBreaker.sol#L115


 - [ ] ID-27
Parameter [CircuitBreaker.setKeeperRegistryAddress(address)._keeperRegistryAddress](contracts/CircuitBreaker.sol#L151) is not in mixedCase

contracts/CircuitBreaker.sol#L151


 - [ ] ID-28
Parameter [CustomMock.test(uint256)._num1](contracts/test/CustomMock.sol#L10) is not in mixedCase

contracts/test/CustomMock.sol#L10


 - [ ] ID-29
Parameter [CircuitBreaker.setVolatility(int256,int8)._percentage](contracts/CircuitBreaker.sol#L132) is not in mixedCase

contracts/CircuitBreaker.sol#L132


 - [ ] ID-30
Parameter [CircuitBreaker.setCustomFunction(address,bytes)._externalContract](contracts/CircuitBreaker.sol#L264) is not in mixedCase

contracts/CircuitBreaker.sol#L264


 - [ ] ID-31
Parameter [CircuitBreaker.setStaleness(uint256)._interval](contracts/CircuitBreaker.sol#L123) is not in mixedCase

contracts/CircuitBreaker.sol#L123


## constable-states
Impact: Optimization
Confidence: High
 - [ ] ID-32
[CustomMock.name](contracts/test/CustomMock.sol#L5) should be constant

contracts/test/CustomMock.sol#L5


