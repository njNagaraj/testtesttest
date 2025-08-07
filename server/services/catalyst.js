import catalyst from 'zcatalyst-sdk-node';

class CatalystService {
  constructor(context = null) {
    this.app = context ? catalyst.initialize(context) : null;
    this.datastore = this.app ? this.app.datastore() : null;
    this.userManagement = this.app ? this.app.userManagement() : null;
  }

  // Initialize with context (for serverless functions)
  initializeWithContext(context) {
    this.app = catalyst.initialize(context);
    this.datastore = this.app.datastore();
    this.userManagement = this.app.userManagement();
    return this;
  }

  // Get table instance
  getTable(tableName) {
    if (!this.datastore) {
      throw new Error('Catalyst not initialized');
    }
    return this.datastore.table(tableName);
  }

  // User Management methods
  async registerUser(userConfig, signupConfig) {
    if (!this.userManagement) {
      throw new Error('User management not initialized');
    }
    
    try {
      const result = await this.userManagement.registerUser(signupConfig, userConfig);
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    if (!this.userManagement) {
      throw new Error('User management not initialized');
    }
    
    try {
      const user = await this.userManagement.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async getUserDetails(userId) {
    if (!this.userManagement) {
      throw new Error('User management not initialized');
    }
    
    try {
      const user = await this.userManagement.getUserDetails(userId);
      return user;
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async insertRecord(tableName, data) {
    const table = this.getTable(tableName);
    try {
      const result = await table.insertRow(data);
      return result;
    } catch (error) {
      console.error(`Error inserting record in ${tableName}:`, error);
      throw error;
    }
  }

  async getRecords(tableName, options = {}) {
    const table = this.getTable(tableName);
    try {
      if (options.pagination) {
        const result = await table.getPagedRows({
          nextToken: options.nextToken,
          maxRows: options.maxRows || 100
        });
        return result;
      } else {
        const result = await table.getAllRows();
        return result;
      }
    } catch (error) {
      console.error(`Error getting records from ${tableName}:`, error);
      throw error;
    }
  }

  async updateRecord(tableName, data) {
    const table = this.getTable(tableName);
    try {
      const result = await table.updateRow(data);
      return result;
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      throw error;
    }
  }

  async deleteRecord(tableName, rowId) {
    const table = this.getTable(tableName);
    try {
      const result = await table.deleteRow(rowId);
      return result;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      throw error;
    }
  }
}

export default CatalystService;