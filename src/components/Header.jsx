/**
 * Brand header.
 *
 * Both images are the originals, extracted from the saved original-homepage.html
 * into public/img/ (no more inline base64 blobs):
 *   live-matka-banner.png - 292x57 "Image of live.matka"
 *   live-matka-laxmi.jpg  - 90x68  "Live Matka LAXMI_PICTURE"
 */
export default function Header() {
  return (
    <>
      <div className="m-icon">
        <img
          src="/img/live-matka-banner.png"
          alt="Image of live.matka"
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
          src="/img/live-matka-laxmi.jpg"
          alt="Live Matka LAXMI_PICTURE"
          width="90"
          height="68"
        />
        <p style={{ color: 'black', display: 'inline-block', fontSize: '16px' }}>
          !! Welcome to Live Matka international !! Satta Matka Fast Result
        </p>
      </div>
    </>
  );
}
