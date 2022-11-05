#!/usr/bin/env ts-node
/**
 * 【hiccup】
 * When you upload a file to cloud drive, client splits whole file into different chunks with continuous chunk_id.
 * In this case, you may implement 3 function:
 *  1) init(id) First chunk_id which might not be 1, could be 10
 *  2) handle(id)  handle chunk_id
 *  3) get_lowest_missing_chunk_id() -> id get smallest chunk_id which is not handled
 *
 * 当你上传一个文件到cloud drive，client端会把这个文件分成一个一个chunk，chunk_id是连续的。作为server端你要实现以下三个func
 *  1）init(id) ->id是chunk的第一个id，或者说是初始id，可能不是1，可能是10,20.。。
 *  2) handle(id) ->handle 这个id
 *  3) get_lowest_missing_chunk_id() ->在已经收到的chunk id中寻找最小的，没有被handle的id
 *
 * 【use case】
 * const upload = new Upload();
 * upload.init(10)
 * upload.get_lowest_missing_chunk_id() //-> 10
 * upload.handle(10)
 * upload.handle(11)
 * upload.handle(20)
 * upload.get_lowest_missing_chunk_id() //->12
 * upload.get_lowest_missing_chunk_id() //->12
 * upload.handle(12)
 * upload.get_lowest_missing_chunk_id() //->13
 */

class Upload {
  initId: number;
  areas: [number, number][];
  initProcessed: boolean;
  init(id: number) {
    this.initId = id;
    this.initProcessed = false;
    this.areas = [[id, Number.MAX_SAFE_INTEGER]];
  }
  private updateAreas(id: number) {
    for (const key in this.areas) {
      const area = this.areas[key];
      const numberKey = parseInt(key);
      if (id >= area[0] && id < area[1]) {
        if (id === area[0] + 1 && id === area[1] - 1) {
          this.areas.splice(numberKey, 1);
        } else if (id === area[0] + 1) {
          area[0]++;
        } else if (id === area[1] - 1) {
          area[1]--;
        } else {
          const newArea: [number, number] = [id, area[1]];
          area[1] = id;
          this.areas.splice(numberKey + 1, 0, newArea);
        }
        return;
      }
    }
  }
  handle(id: number) {
    if (id === this.initId) {
      this.initProcessed = true;
      return;
    }
    this.updateAreas(id);
  }
  get_lowest_missing_chunk_id() {
    if (this.initProcessed === undefined) throw new Error("init first");
    if (this.initProcessed === false) return this.initId;

    return this.areas[0][0] + 1;
  }
  get_lowest_missing_chunk_id_with_log() {
    const lowest_missing_chunk_id = this.get_lowest_missing_chunk_id();
    console.log(lowest_missing_chunk_id);
  }
}

// test
const upload = new Upload();
upload.init(10)
upload.get_lowest_missing_chunk_id_with_log() //-> 10
upload.handle(10)
upload.handle(11)
upload.handle(20)
upload.get_lowest_missing_chunk_id_with_log() //->12
upload.get_lowest_missing_chunk_id_with_log() //->12
upload.handle(12)
upload.get_lowest_missing_chunk_id_with_log() //->13