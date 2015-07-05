module.exports = exports = {
	imgDir  : __dirname + '/images',
  dbURL     : 'mongodb://localhost:27017/images',

	// time to wait (ms) between requests.
	// 3 seconds seems to be reliably enough so as to not
	// overload local network or get blocked by google.
  pause     : 1000,

	// number of random words to search per execution
  wordCount : 2,

  // results per page (max 8)
  rsz       : 8,

  // Restricts the search to images of the specified size, where size can be one of:
	//   imgsz=icon restricts results to small images
	//   imgsz=small|medium|large|xlarge restricts results to medium-sized images
	//   imgsz=xxlarge restricts results to large images
	//   imgsz=huge restricts resykts to extra-large images
  imgsz     : 'xxlarge',

  // number of images to download per word (max 64)
  imgCount     : 8
};