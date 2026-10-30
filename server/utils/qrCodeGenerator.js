const QRCode = require('qrcode');

const generateQRCode = async (bookingData) => {
  try {
    const payload = JSON.stringify({
      bookingRef: bookingData.bookingReference,
      movie: bookingData.movieTitle,
      theatre: bookingData.theatreName,
      showDate: bookingData.showDate,
      showTime: bookingData.showTime,
      seats: bookingData.seats,
      totalAmount: bookingData.totalAmount,
      verifyUrl: `https://imovies.cinemas/verify/${bookingData.bookingReference}`
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 250,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return qrDataUrl;
  } catch (err) {
    console.error('[QRCode] Error generating QR code:', err.message);
    return '';
  }
};

module.exports = generateQRCode;
