import { FixedNumber } from "@ethersproject/bignumber";
import { BigNumber } from "ethers";
import { ButtonForm, WindowAlert } from "packard-belle";
import { useEffect, useRef, useState } from "react";
import {
  balanceToFixedNumber,
  ContractType,
  fixedNumberToBalance,
  Item,
  two,
  useOnKeyDown,
  zero,
} from "../../utils/utils";
import missingIcon from "./missing.png";

import "./PickAmount.css";
interface PickAmountProps {
  item: Item<ContractType>;
  onClose: () => void;
  onAdd: (amount: BigNumber) => void;
  type: "offer" | "request";
}
export function PickAmountWindow({
  item,
  onClose,
  onAdd,
  type,
}: PickAmountProps) {
  useOnKeyDown("Escape", onClose);

  const amountInTrade = item.originalBalance.sub(item.balance);

  const [amount, setAmount] = useState(
    balanceToFixedNumber(amountInTrade, item.decimals).toString()
  );
  const [parsedAmount, setParsedAmount] = useState(amountInTrade);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const notEnoughMoney = parsedAmount.gt(item.originalBalance);
  useOnKeyDown("Enter", () => {
    if (notEnoughMoney) {
      return;
    }
    onAdd(parsedAmount);
  });

  return (
    <div
      className="modal"
      style={{
        zIndex: 2,
      }}
    >
      <WindowAlert
        title={`${type === "offer" ? "Offer" : "Request"} some ${item.name}?`}
        className="pickAmount"
        onClose={onClose}
      >
        <div>
          <div className="pickAmountContentsContainer">
            <img
              src={item.iconUrl || missingIcon}
              alt={item.name}
              width="128"
              style={{
                padding: "8px",
              }}
            />
            <div className="pickAmountInput">
              {amountInTrade.isZero()
                ? ""
                : `Current Offer:\n${balanceToFixedNumber(
                    amountInTrade,
                    item.decimals
                  )}`}
              <div>
                <input
                  type="text"
                  className="InputText text"
                  value={amount}
                  placeholder="Enter an amount (or 0)"
                  onChange={(ev) => {
                    let fakeNum = ev.target.value;
                    if (fakeNum.endsWith(".")) {
                      fakeNum += "0";
                    }
                    if (fakeNum.length === 0) {
                      fakeNum = "0";
                    }
                    try {
                      const num = FixedNumber.from(fakeNum);
                      const bigNumAmount = fixedNumberToBalance(
                        num,
                        item.decimals
                      );
                      setAmount(ev.target.value);
                      setParsedAmount(bigNumAmount);
                    } catch (err) {
                      console.warn("Failed to parse balance", err);
                      // lulw
                    }
                  }}
                  ref={inputRef}
                />
                /
                {balanceToFixedNumber(
                  item.originalBalance,
                  item.decimals
                ).toString()}
              </div>
              <div className="pickAmountExtraButtons">
                <ButtonForm
                  onClick={() => {
                    setAmount("0");
                    setParsedAmount(zero);
                  }}
                >
                  Zero
                </ButtonForm>
                <ButtonForm
                  onClick={() => {
                    const half = item.originalBalance.div(two);
                    setAmount(
                      balanceToFixedNumber(half, item.decimals).toString()
                    );
                    setParsedAmount(half);
                  }}
                >
                  Half
                </ButtonForm>
                <ButtonForm
                  onClick={() => {
                    setAmount(item.originalBalance.toString());
                    setAmount(
                      balanceToFixedNumber(
                        item.originalBalance,
                        item.decimals
                      ).toString()
                    );
                    setParsedAmount(item.originalBalance);
                  }}
                >
                  Maximum
                </ButtonForm>
              </div>
            </div>
          </div>
          <div className="error">
            {notEnoughMoney
              ? `not enough ${item.name}, you ${
                  type === "offer" ? "offered" : "requested"
                } ${balanceToFixedNumber(parsedAmount, item.decimals)} but ${
                  type === "offer" ? "you" : "they"
                } only have ${balanceToFixedNumber(
                  item.originalBalance,
                  item.decimals
                )}.`
              : ""}
          </div>
          <div className="pickAmountButtons">
            <ButtonForm
              isDisabled={notEnoughMoney}
              onClick={() => onAdd(parsedAmount)}
            >
              {type === "offer" ? "Offer" : "Request"}
            </ButtonForm>
            <ButtonForm onClick={onClose}>Cancel</ButtonForm>
          </div>
        </div>
      </WindowAlert>
    </div>
  );
}
