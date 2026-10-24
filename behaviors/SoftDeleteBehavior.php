<?php

namespace app\behaviors;

use Yii;
use yii\base\Behavior;
use yii\db\ActiveRecord;
use yii\db\ActiveQuery;

/**
 * SoftDeleteBehavior adds soft delete functionality to ActiveRecord models
 * 
 * Usage in model:
 * ```php
 * public function behaviors()
 * {
 *     return [
 *         SoftDeleteBehavior::class,
 *     ];
 * }
 * 
 * // Override find() method in model:
 * public static function find()
 * {
 *     return parent::find()->andWhere(['deleted_at' => null]);
 * }
 * ```
 * 
 * The model must have a `deleted_at` column (timestamp, nullable)
 * 
 * @extends Behavior<ActiveRecord&object{deleted_at: string|null}>
 */
class SoftDeleteBehavior extends Behavior
{
    /**
     * Query scope to include soft-deleted records
     * 
     * @return ActiveQuery
     */
    public function withTrashed()
    {
        return $this->owner::find()->where([]);
    }

    /**
     * Query scope to get only soft-deleted records
     * 
     * @return ActiveQuery
     */
    public function onlyTrashed()
    {
        return $this->owner::find()->where([])
            ->andWhere(['not', ['deleted_at' => null]]);
    }

    /**
     * Soft delete the record
     * 
     * @return bool
     */
    public function trash()
    {
        $this->owner->deleted_at = date('Y-m-d H:i:s');
        return $this->owner->save(false, ['deleted_at']);
    }

    /**
     * Restore a soft-deleted record
     * 
     * @return bool
     */
    public function restore()
    {
        $this->owner->deleted_at = null;
        return $this->owner->save(false, ['deleted_at']);
    }

    /**
     * Check if record is soft-deleted
     * 
     * @return bool
     */
    public function isTrashed()
    {
        return $this->owner->deleted_at !== null;
    }
}

