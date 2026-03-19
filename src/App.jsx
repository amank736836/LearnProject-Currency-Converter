import { useState, useEffect } from "react";
import { InputBox } from "./components";
import useCurrencyInfo from "./hooks/useCurrencyinfo.js";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [amount, setAmount] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);

  const [from, setFrom] = useState("usd");
  const [to, setTo] = useState("inr");

  const currencyInfo = useCurrencyInfo(from);
  const options = Object.keys(currencyInfo);

  const swap = () => {
    setFrom(to);
    setTo(from);
    // setAmount(convertedAmount);  // uncomment to swap the amount as well
  };

  const convert = () => {
    setConvertedAmount(amount * currencyInfo[to]);
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.github.com/users/amank736836")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setData(data);
      });
  });

  useEffect(() => {
    convert();
  }, [to, from, amount, swap]);

  return (
    <>
      <Analytics />
      <div
        className="w-full h-screen flex flex-wrap justify-center items-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=600)`,
        }}
      >
      <div className="w-full relative">
        <img
          src={data.avatar_url}
          alt="Git picture"
          className=" rounded-full h-160 w-160 absolute translate-x-1/4 -translate-y-1/2 border-3xl ml-12 p-4"
        ></img>

        <div className="absolute translate-x-full -translate-y-1/2 max-w-4xl mx-auto border border-gray-60 rounded-lg p-12 backdrop-blur-sm bg-blue-600/30">
          <h1 className=" w-full mx-auto text-center text-white text-5xl pb-10">
            🤑💵Currency app by AmanK🤗
          </h1>
          <form
          // onSubmit={(e) => {
          //     e.preventDefault();
          //     // convert();
          // }}
          >
            <div className="w-full mb-1 pb-2">
              <InputBox
                label="From"
                amount={amount}
                currencyOptions={options}
                onCurrencyChange={(currency) => {
                  if (currency == to) {
                    setFrom(currency);
                    setTo(from);
                  } else {
                    setTo(currency);
                  }
                }}
                selectedCurrency={from}
                onAmountChange={(amount) => setAmount(amount)}
              />
            </div>
            <div className="relative w-full h-0.5 text-4xl">
              <button
                type="button"
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black rounded-full bg-blue-600 text-white px-2 py-0.5"
                onClick={swap}
              >
                SWAP
              </button>
            </div>
            <div className="w-full mt-1 mb-4 pt-2">
              <InputBox
                label="To"
                amount={convertedAmount}
                currencyOptions={options}
                onCurrencyChange={(currency) => {
                  if (currency == from) {
                    setTo(currency);
                    setFrom(to);
                  } else {
                    setTo(currency);
                  }
                }}
                selectedCurrency={to}
                amountDisable
              />
            </div>
            {/* <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg">
                        Convert {from.toUpperCase()} to {to.toUpperCase()}
                    </button> */}
          </form>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
