exports.index = async (ctx) => {
    const title = '首页';
    //let rs = await db.find('article_info',['id','title'],{id:1, title:'2'});
    //let rs = await db.find('tbl_activity_main', ['activity_id', 'activity_name'], '  where ? ', [{activity_id:'4',activity_name:'444'}]);
    //let rs = await db.insert('tbl_activity_main', {activity_id:'4', activity_name:'444'});
    //let rs = await db.update('tbl_activity_main',' ? where ? ', [{activity_name:'333'}, {activity_id:'3'}]);
    //let rs = await db.delete('tbl_activity_main', ' where ? activity_id=? OR activity_id=?', [null,2,4]);
    //console.log(rs);
    /*db.query('select activity_id, activity_name from tbl_activity_main where activity_id = ? AND activity_name = ? ', ['4','444'], function(rs){
      console.log(rs);
    });*/

    //ctx.session.username = ctx.query.username || 'nandy007';
    /*console.log(ctx.session);
    console.log(ctx.session.sid);*/
    /*const fetch = require('chestnut-utils').fetch;
    const jqlite = require('chestnut-utils').jqlite;
    let rs = await fetch('https://auth.exmobi.cn/login?output=json', {
      ctx: ctx,
      requestId: 'exmobi',
      method: 'post',
      body: 'username=nandy007&password=111111',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log(rs.body);
    let rs1 = await fetch('https://www.exmobi.cn/console/main.html', {
      ctx: ctx,
      requestId: 'exmobi',
    });
    
    const $ = jqlite(rs1.body);
    console.log($('#consumer').html());*/
    
    console.log('router:'+ctx.session.sid);
    await ctx.render('index', {
        title
    });
};

exports.main = async (ctx) => {
    const title = '主页';
    const username = ctx.session.username || '';
    await ctx.render('main', {
        title,
        username
    });
};