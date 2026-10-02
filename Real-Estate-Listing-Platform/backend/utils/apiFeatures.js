class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const exclude = ['page', 'sort', 'limit', 'fields', 'search', 'lat', 'lng', 'radius'];
    exclude.forEach(f => delete queryObj[f]);

    let queryStr = JSON.stringify(queryObj);
    // Replace gte, gt, lte, lt operators with MongoDB equivalent $gte, $gt, $lte, $lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, m => `$${m}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search() {
    if (this.queryString.search) {
      // Find matches using text index Search
      this.query = this.query.find({ 
        $text: { $search: this.queryString.search } 
      });
    }
    return this;
  }

  geoFilter() {
    const { lat, lng, radius } = this.queryString;
    if (lat && lng && radius) {
      // radius divided by 3963.2 converts miles to radians
      this.query = this.query.find({
        location: {
          $geoWithin: { 
            $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 3963.2] 
          }
        }
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
