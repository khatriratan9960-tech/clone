/** FREE GAME ZONE OPEN-CLOSE guessing blocks. */
export default function FreeGameZone({ data }) {
  if (!data?.markets?.length) return null;

  return (
    <div className="oc-fg">
      <h4>FREE GAME ZONE OPEN-CLOSE</h4>
      <div className="ocfg txta-1 rbd onmb gpg0">
        <div style={{ border: '2px solid #ff019e', margin: '5px 5px 0', borderRadius: '10px' }}>
          <p className="k2w5">
            ✔DATE:↬ : {data.date} ↫
          </p>
          <span style={{ fontSize: '22px', color: '#000', textShadow: '1px 1px 2px #fff' }}>
            FREE GUESSING DAILY
          </span>
          <h5 className="k2w5">OPEN TO CLOSE FIX ANK</h5>
        </div>

        <div className="d1635">
          {data.markets.map((m) => (
            <div className="oc-3a-69" key={m.market}>
              <p className="g5a1">↪ {m.market}</p>
              {m.values.map((v, i) => (
                <p className="l9w2v" key={i}>
                  {v}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
