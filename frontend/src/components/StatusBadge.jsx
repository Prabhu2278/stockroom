function StatusBadge({ qty, min }) {
  let text = "In stock";
  let color = "ok";
  if (qty === 0) {
    text = "Out of stock";
    color = "out";
  } else if (qty <= min) {
    text = "Low stock";
    color = "low";
  }
  return <span className={"badge " + color}>{text}</span>;
}

export default StatusBadge;
