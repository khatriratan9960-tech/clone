/**
 * Brand header.
 *
 * The old brand logo banner (m-icon) was removed - its artwork carried the
 * old brand name. The remaining image was extracted from the saved
 * original-homepage.html into public/img/ (no more inline base64 blobs):
 *   live-matka-laxmi.jpg  - 90x68  "Live Matka LAXMI_PICTURE"
 */
export default function Header() {
  return (
    <>
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
