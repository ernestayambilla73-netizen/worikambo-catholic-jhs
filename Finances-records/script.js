const form = document.getElementById("moneyForm");
const amountInput = document.getElementById("amount");
const senderInput = document.getElementById("sender");
const dateInput = document.getElementById("date");
const purposeInput = document.getElementById("purpose");
const noteInput = document.getElementById("note");

let transactions = JSON.parse(localStorage.getItem("schoolMoneyTransactions") || "[]");

// Set today's date by default.
dateInput.value = new Date().toISOString().split("T")[0];

function save() {
  localStorage.setItem("schoolMoneyTransactions", JSON.stringify(transactions));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(amountInput.value);

  if (amount <= 0) {
    alert("Please enter an amount greater than zero.");
    return;
  }

  transactions.push({
    id: Date.now().toString(),
    amount,
    sender: senderInput.value.trim(),
    date: dateInput.value,
    purpose: purposeInput.value,
    note: noteInput.value.trim()
  });

  save();
  alert("Money record added successfully. You can view it on the Records page.");
  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  amountInput.focus();
});
