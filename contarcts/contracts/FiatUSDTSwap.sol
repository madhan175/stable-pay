// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Fiat-USDT Swap Contract with GST
/// @notice Swap between Fiat currencies and USDT with manual rate updates
contract FiatUSDTSwap is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdt;
    address public immutable admin;
    uint256 public constant GST_RATE = 1800; // 18% (basis points)

    // Supported currencies and rates (scaled by 1e8)
    mapping(string => bool) public supportedCurrencies;
    mapping(string => uint256) public currencyRates;

    // Swap history
    struct SwapRecord {
        address user;
        string fromCurrency;
        string toCurrency;
        uint256 fromAmount;
        uint256 toAmount;
        uint256 gstAmount;
        uint256 timestamp;
        bytes32 txHash;
    }

    mapping(address => SwapRecord[]) public userSwapHistory;
    mapping(bytes32 => bool) public processedSwaps;
    SwapRecord[] public allSwaps;
    uint256 public totalSwaps;

    // Events
    event SwapExecuted(
        address indexed user,
        string fromCurrency,
        string toCurrency,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 gstAmount,
        bytes32 indexed txHash
    );
    event CurrencyUpdated(string currency, uint256 rate, bool supported);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(address _usdt) {
        require(_usdt != address(0), "Invalid USDT address");
        usdt = IERC20(_usdt);
        admin = msg.sender;

        // Initialize supported currencies
        supportedCurrencies["USDT"] = true;
        supportedCurrencies["INR"] = true;
        supportedCurrencies["EUR"] = true;
        supportedCurrencies["USD"] = true;

        // Set initial rates (scaled by 1e8)
        // 1 USDT = 1 USD (pegged)
        currencyRates["USDT"] = 1e8;
        currencyRates["USD"] = 1e8;
        // 1 EUR = 1.08 USD (example rate)
        currencyRates["EUR"] = 108e6;
        // 1 USD = 88.78 INR
        // So 1 INR = 1/88.78 USD = 0.01126380 USD
        // Rate stored as: (1 / 88.78) * 1e8 = 1,126,380
        currencyRates["INR"] = 1126380;
    }

    /// @notice Calculate swap amounts with GST
    function calculateSwap(
        string memory fromCurrency,
        string memory toCurrency,
        uint256 fromAmount
    ) public view returns (uint256 toAmount, uint256 gstAmount) {
        require(supportedCurrencies[fromCurrency], "Unsupported from currency");
        require(supportedCurrencies[toCurrency], "Unsupported to currency");
        require(fromAmount > 0, "Invalid amount");

        uint256 fromRate = currencyRates[fromCurrency];
        uint256 toRate = currencyRates[toCurrency];

        // Convert to USDT equivalent first
        // Rates are stored scaled by 1e8, fromAmount is scaled by 1e18
        uint256 usdtEquivalent = _compareStrings(fromCurrency, "USDT")
            ? fromAmount
            : (fromAmount * fromRate) / 1e8;

        // Apply GST for INR transactions
        if (_compareStrings(fromCurrency, "INR") || _compareStrings(toCurrency, "INR")) {
            gstAmount = (usdtEquivalent * GST_RATE) / 10000;
            usdtEquivalent -= gstAmount;
        }

        // Convert to target currency
        toAmount = _compareStrings(toCurrency, "USDT")
            ? usdtEquivalent
            : (usdtEquivalent * toRate) / 1e8;
    }

    /// @notice Swap from Fiat to USDT (admin executes)
    function swapFiatToUSDT(
        address user,
        string memory fromCurrency,
        uint256 fromAmount,
        bytes32 txHash
    ) external onlyAdmin nonReentrant {
        require(!processedSwaps[txHash], "Already processed");
        require(!_compareStrings(fromCurrency, "USDT"), "Use swapUSDTToFiat");

        (uint256 usdtAmount, uint256 gstAmount) = calculateSwap(fromCurrency, "USDT", fromAmount);

        processedSwaps[txHash] = true;

        usdt.safeTransfer(user, usdtAmount);
        _recordSwap(user, fromCurrency, "USDT", fromAmount, usdtAmount, gstAmount, txHash);

        emit SwapExecuted(user, fromCurrency, "USDT", fromAmount, usdtAmount, gstAmount, txHash);
    }

    /// @notice Swap from USDT to Fiat
    function swapUSDTToFiat(
        string memory toCurrency,
        uint256 usdtAmount,
        bytes32 txHash
    ) external nonReentrant {
        require(!processedSwaps[txHash], "Already processed");
        require(!_compareStrings(toCurrency, "USDT"), "Use swapFiatToUSDT");
        require(usdtAmount > 0, "Invalid amount");

        (uint256 fiatAmount, uint256 gstAmount) = calculateSwap("USDT", toCurrency, usdtAmount);

        processedSwaps[txHash] = true;

        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);
        _recordSwap(msg.sender, "USDT", toCurrency, usdtAmount, fiatAmount, gstAmount, txHash);

        emit SwapExecuted(msg.sender, "USDT", toCurrency, usdtAmount, fiatAmount, gstAmount, txHash);
    }

    /// @notice Update currency rate (admin)
    function updateCurrency(
        string memory currency,
        uint256 rate,
        bool supported
    ) external onlyAdmin {
        supportedCurrencies[currency] = supported;
        if (supported && rate > 0) {
            currencyRates[currency] = rate;
        }
        emit CurrencyUpdated(currency, rate, supported);
    }

    /// @dev Record swap
    function _recordSwap(
        address user,
        string memory fromCurrency,
        string memory toCurrency,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 gstAmount,
        bytes32 txHash
    ) internal {
        SwapRecord memory record = SwapRecord({
            user: user,
            fromCurrency: fromCurrency,
            toCurrency: toCurrency,
            fromAmount: fromAmount,
            toAmount: toAmount,
            gstAmount: gstAmount,
            timestamp: block.timestamp,
            txHash: txHash
        });

        userSwapHistory[user].push(record);
        allSwaps.push(record);
        totalSwaps++;
    }

    /// @dev Compare two strings
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /// @notice Get user's swap history
    function getUserSwapHistory(address user) external view returns (SwapRecord[] memory) {
        return userSwapHistory[user];
    }

    /// @notice Get recent swaps (last 10)
    function getRecentSwaps() external view returns (SwapRecord[] memory) {
        uint256 length = allSwaps.length;
        uint256 returnLength = length > 10 ? 10 : length;
        SwapRecord[] memory recentSwaps = new SwapRecord[](returnLength);

        for (uint256 i = 0; i < returnLength; i++) {
            recentSwaps[i] = allSwaps[length - 1 - i];
        }

        return recentSwaps;
    }

    /// @notice Get total swaps
    function getTotalSwaps() external view returns (uint256) {
        return totalSwaps;
    }

    /// @notice Check if currency is supported
    function isCurrencySupported(string memory currency) external view returns (bool) {
        return supportedCurrencies[currency];
    }
}