import {Building} from "@prisma/client";
import prisma from "../../../shared/prisma";

const createBuilding = async (data:Building):Promise<Building> => {
   const result = await prisma.building.create({
      data
   });
   return result;
}

const getAllBuilding = async ()=>{
   const result = await prisma.building.findMany();
   return result;
}

export const BuildingService = {
   createBuilding,
   getAllBuilding
}