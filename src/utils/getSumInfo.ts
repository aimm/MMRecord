import { invoke } from '@tauri-apps/api';
import {lcuSummonerInfo,SumInfoRes,ExcelChamp} from "../interface/SummonerInfo";
import {englishToChinese,dealDivsion} from "./tool";
import {champDict} from "../assets/champList";

export const querySummonerInfo = async (sumId:number):Promise<SumInfoRes> => {
  const summonerInfo: lcuSummonerInfo = sumId===0
    ? await invoke('get_cur_sum')
    : await invoke('get_other_sum',{summonerId:String(sumId)})
  const [sumInfo,rankPoint,excelChamp] =
    await Promise.all([getSumInfo(summonerInfo),
      getRankPoint(summonerInfo.puuid),
      getExcelChamp(`${summonerInfo.summonerId}`)])
  return {sumInfo,rankPoint,excelChamp}
}

const getSumInfo = (summonerInfo:lcuSummonerInfo) => {
  const imgUrl = `https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/usericon/${summonerInfo.profileIconId}.png`
  return {
    name: summonerInfo.displayName,
    imgUrl,
    lv: summonerInfo.summonerLevel,
    xpSL: summonerInfo.xpSinceLastLevel,
    xpNL: summonerInfo.xpUntilNextLevel,
    puuid: summonerInfo.puuid,
    currentId: summonerInfo.summonerId
  }
}

// 查询召唤师排位分数
const getRankPoint = async (puuid: string) => {
  const rankPoint:any = await invoke('get_cur_rank_point',{puuid:puuid})
  if (rankPoint.queues === undefined) {
    return ['error','error','error']
  }
  // 单双排位/ 灵活排位/ 云顶之亦
  let rankSolo = rankPoint.queues.find((i: any) => i.queueType === "RANKED_SOLO_5x5")
  let rankSr = rankPoint.queues.find((i: any) => i.queueType === "RANKED_FLEX_SR")
  let rankTft = rankPoint.queues.find((i: any) => i.queueType === "RANKED_TFT")

  let RANKED_SOLO = rankSolo.tier === "" ? '未定级' : `${englishToChinese(rankSolo.tier)}${dealDivsion(rankSolo.division)} ${rankSolo.leaguePoints}`
  let RANKED_FLEX_SR = rankSr.tier === "" ? '未定级' : `${englishToChinese(rankSr.tier)}${dealDivsion(rankSr.division)} ${rankSr.leaguePoints}`
  let RANKED_TFT = rankTft.tier === "" ? '未定级' : `${englishToChinese(rankTft.tier)}${dealDivsion(rankTft.division)} ${rankTft.leaguePoints}`
  return [RANKED_SOLO, RANKED_FLEX_SR, RANKED_TFT]
}

// 获取召唤师英雄绝活数据
const getExcelChamp = async (summonerId: string):Promise<ExcelChamp[]> => {
    const summonerSuperChampData: any = await invoke('get_excel_champ',{summonerId:summonerId})
    return  summonerSuperChampData.slice(0, 20).reduce((res: any, item: any) => {
      return res.concat({
        champImgUrl: `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[item.championId].alias}.png`,
        champLevel: item.championLevel,
        championPoints: item.championPoints,
        champLabel:`${champDict[item.championId].label} ${champDict[item.championId].title}`
      })
    }, [])
}

// 查询其他召唤师段位信息
export const querySumRank = async (summonerId:string) => {
  const summonerInfo: lcuSummonerInfo = await invoke('get_other_sum',{summonerId:summonerId})
  return await getRankPoint(summonerInfo.puuid)
}
