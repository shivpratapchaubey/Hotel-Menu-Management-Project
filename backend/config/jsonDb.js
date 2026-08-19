const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial default structure
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    menuitems: [],
    categories: [],
    orders: [],
    users: []
  }, null, 2));
}

class JsonDb {
  constructor() {
    this.filePath = DB_FILE;
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading JSON db:", error);
      return { menuitems: [], categories: [], orders: [], users: [] };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error("Error writing JSON db:", error);
      return false;
    }
  }
}

const dbInstance = new JsonDb();

class JsonModel {
  constructor(collectionName) {
    this.collectionName = collectionName.toLowerCase() + 's'; // e.g. menuitem -> menuitems
  }

  getAll() {
    const data = dbInstance.read();
    return data[this.collectionName] || [];
  }

  saveAll(records) {
    const data = dbInstance.read();
    data[this.collectionName] = records;
    dbInstance.write(data);
  }

  async find(query = {}) {
    const records = this.getAll();
    return records.filter(item => {
      for (let key in query) {
        // Simple query evaluation (handles string, boolean, numbers, and basic check for nested or array values)
        if (query[key] !== undefined) {
          if (Array.isArray(item[key]) && typeof query[key] === 'string') {
            if (!item[key].includes(query[key])) return false;
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const records = await this.find(query);
    return records[0] || null;
  }

  async findById(id) {
    const records = this.getAll();
    const found = records.find(item => item._id === id || String(item._id) === String(id));
    if (!found) return null;
    
    // Return with a save() method to mimic Mongoose documents
    return this.wrapDoc(found);
  }

  async create(docData) {
    const records = this.getAll();
    const newDoc = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
      ...docData
    };
    records.push(newDoc);
    this.saveAll(records);
    return this.wrapDoc(newDoc);
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const records = this.getAll();
    const idx = records.findIndex(item => item._id === id || String(item._id) === String(id));
    if (idx === -1) return null;

    // Handle operator updates like $push or $set if needed
    const record = records[idx];
    let updatedRecord = { ...record };

    if (updateData.$push) {
      for (let key in updateData.$push) {
        if (!updatedRecord[key]) updatedRecord[key] = [];
        updatedRecord[key].push(updateData.$push[key]);
      }
      delete updateData.$push;
    }

    // Merge standard properties
    updatedRecord = { ...updatedRecord, ...updateData };
    records[idx] = updatedRecord;
    this.saveAll(records);
    return this.wrapDoc(updatedRecord);
  }

  async findByIdAndDelete(id) {
    const records = this.getAll();
    const idx = records.findIndex(item => item._id === id || String(item._id) === String(id));
    if (idx === -1) return null;
    const deleted = records.splice(idx, 1)[0];
    this.saveAll(records);
    return deleted;
  }

  async deleteMany(query = {}) {
    const records = this.getAll();
    const remaining = records.filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    this.saveAll(remaining);
    return { deletedCount: records.length - remaining.length };
  }

  wrapDoc(doc) {
    if (!doc) return null;
    const self = this;
    // Add Mongoose compatibility helpers
    const wrapped = { ...doc };
    wrapped.save = async function() {
      const records = self.getAll();
      const idx = records.findIndex(item => item._id === this._id);
      if (idx !== -1) {
        records[idx] = { ...this };
        delete records[idx].save; // Don't persist save function
      } else {
        records.push({ ...this });
      }
      self.saveAll(records);
      return this;
    };
    return wrapped;
  }
}

module.exports = {
  JsonDb: dbInstance,
  JsonModel
};
