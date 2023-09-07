const { Users, UserItems } = require('../models/dbObjects');

async function cringeInjector(target){
    try{
        console.log(target);
        const userRecord = await Users.findOne({ where: { user_id: target } });
        
        await userRecord.increment( 'suspicion_level', { by: 3 });
        await userRecord.reload();
        
        
    } catch (error){
        console.error(error);
    }
}

async function intelInquirer(target){
    try{
        const userRecord = await Users.findOne({ where: { user_id: target } });
        let financialStatus, activeBuff;
        if (userRecord.financial_status === 0){
            financialStatus = 'Poor';
        } else if (userRecord.financial_status === 1){
            financialStatus = 'Average';
        } else if (userRecord.financial_status === 2){
            financialStatus = 'Wealthy';
        } else{
            financialStatus = 'Rich';
        }
        if (userRecord.active_buff === null){
            activeBuff = 'None';
        } else {
            activeBuff = userRecord.active_buff;
        }
        return [userRecord.suspicion_level, financialStatus, activeBuff];
    } catch (error){
        console.error(error);
    }
}

async function miragePerfume(target){
    try{
        const userRecord = await Users.findOne({ where: { user_id: target } });
        await userRecord.update({ suspicion_level: 0 });
        await userRecord.reload();
    } catch (error){
        console.error(error);
    }
}

async function tippersFedora(target){
    try{
        console.log('before');
        const userRecord = await Users.findOne({ where: { user_id: target } });
        userRecord.update({ active_buff: 'Fedora' });
        console.log('after');
    } catch (error){
        console.error(error);
    }
}

async function neckbeardsLegalTome(target){
    try{
        const userRecord = await Users.findOne({ where: { user_id: target } });
        userRecord.increment( 'sentence_length', { by: 2 });
        userRecord.update({ active_debuff: 'Tome' });
    } catch (error){
        console.error(error);
    }
}

async function tipperJailCellKey(target){
    try{
        const userRecord = await Users.findOne({ where: { user_id: target } });
        userRecord.update({ isInJail: false });
    } catch (error){
        console.error(error);
    }
}

async function redditGoldBrew(target){
    try{
        const userRecord = await Users.findOne({ where: { user_id: target } });
        await userRecord.update({ suspicion_level: 3 });
        await userRecord.reload();
    } catch (error){
        console.error(error);
    }
}

async function remove(item, target){
    try{
        console.log(`Removing ${item} from ${target}`);
        const userRecord = await Users.findOne({ where: { user_id: target } });
        if(!userRecord) {
            console.log('Item removal error: User not found');
            return;
        }
        const record = await UserItems.findOne({ where: { userUserId: target, itemId: item } });
        if (!record) {
            console.log('Item removal error: Item not found');
            return;
        }
        if(record.quantity > 1){
            await record.update({ quantity: record.quantity - 1 });
            await record.reload();
        }
        else if (record.quantity === 1){
            await record.destroy();
        }
    } catch (error){
        console.error(error);
    }
}



module.exports = {
    cringeInjector, intelInquirer, miragePerfume, tippersFedora, neckbeardsLegalTome, redditGoldBrew, tipperJailCellKey,
    remove
}