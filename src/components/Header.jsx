/**
 * Brand header.
 *
 * Both images are the originals, extracted from the saved dpboss.html
 * into public/img/ (no more inline base64 blobs):
 *   dpboss-banner.png - 292x57 "Image of dpboss.tax"
 *   dpboss-laxmi.jpg  - 90x68  "dpboss net LAXMI_PICTURE"
 */
export default function Header() {
  return (
    <>
      <div className="m-icon">
        <img
          src="/img/dpboss-banner.png"
          alt="Image of dpboss.tax"
          height="57"
          width="292"
        />
      </div>

      <div
        style={{
          marginBottom: '1px',
          display: 'flex',
          padding: '5px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '10px',
          border: '2px solid #ff182c',
          boxShadow: '0 0 20px 0 rgb(0 0 0 / 40%)',
        }}
      >
        <img
          src="/img/dpboss-laxmi.jpg"
          alt="dpboss net LAXMI_PICTURE"
          width="90"
          height="68"
        />
        <p style={{ color: 'black', display: 'inline-block', fontSize: '16px' }}>
          !! Welcome to dpboss international !! Satta Matka Fast Result
        </p>
      </div>
    </>
  );
}
