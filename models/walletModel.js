class Wallet{
    constructor(id, type, label, creation_date, asset_list){
        this.id = id;
        this.type = type;
        this.label = label;
        this.creation_date = creation_date;
        this.asset_list = asset_list;
    }
}

module.exports = Wallet;