/** AAJ KYA PASS HUA box. */
export default function PassList({ items, date }) {
  if (!items?.length) return null;

  return (
    <div className="aaj-pass">
      <span className="hd1">AAJ KYA PASS HUA</span>
      <span className="hd2"> Date :- {date}</span>
      {items.map((t, i) => (
        <div className="aj-pass-txt" key={i}>
          {t}
        </div>
      ))}
    </div>
  );
}
