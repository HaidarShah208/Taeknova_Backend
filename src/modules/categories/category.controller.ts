import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "@common/helpers/apiResponse";
import { CategoryService } from "@modules/categories/category.service";

export class CategoryController {
  constructor(private readonly categoryService = new CategoryService()) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.categoryService.list();
    sendResponse(res, StatusCodes.OK, "Categories fetched", data);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const data = await this.categoryService.create(req.body);
    sendResponse(res, StatusCodes.CREATED, "Category created", data);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const data = await this.categoryService.update(String(req.params.categoryId), req.body);
    sendResponse(res, StatusCodes.OK, "Category updated", data);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.categoryService.remove(String(req.params.categoryId));
    sendResponse(res, StatusCodes.OK, "Category deleted");
  };
}
