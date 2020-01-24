//mock db documents
const documents = [
    {
        _id: "id_user_1",
        //hkid: AB9876543
        hkidHash: "8f570c61545fac95e0964ec90bb33ee967edf97af76d23269005a4efe828f41e",
        offset: 0,
    },
    // {
    //     _id: "id_user_2",
    //     //hkid: A5555550
    //     hkidHash: "fb1de4c0034eed393cc7103270807fb44f9deb9483425aa243006736a0ecf81e",
    //     offset: 1,
    // }
];

module.exports = {
    create: jest.fn(query => {
        return {
            _id: "id_user_new",
            hkidHash: query.hkidHash,
            offset: query.offset,
        };
    }),
    findOne: jest.fn(query => {
        const _id = query._id;
        for (let item of documents) {
            if (item._id == query._id) {
                if (query.hkidHash && query.hkidHash !== item.hkidHash) {
                    break;
                }
                return {
                    lean() { return this; },
                    exec() { return Promise.resolve(item); },
                };
            }
        }
        return {
            lean() { return this; },
            exec() { return Promise.resolve(null); }
        };
    }),
    find: jest.fn()
        .mockReturnValue({
            lean() { return this; },
            exec() { return Promise.resolve(documents); },
        }),
    exists: jest.fn(query => {
        for (let item of documents) {
            if (query._id && query._id === item._id) {
                return Promise.resolve(true);
            }
            if (query.hkidHash && query.hkidHash === item.hkidHash) {
                return Promise.resolve(true);
            }
        }
        return false;
    }),
};
