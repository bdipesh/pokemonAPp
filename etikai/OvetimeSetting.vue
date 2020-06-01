==== overtime dialog ====
<template>
  <v-form ref="overtimeSettings" @submit.prevent="getFormAction">
    <non-field-form-errors
      v-if="nonFieldErrors"
      :non-field-errors="nonFieldErrors"
    ></non-field-form-errors>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12" class="py-0 mx-3">
            <v-checkbox
              v-model="formValues.require_prior_approval"
              v-bind="
                veeValidate('require_prior_approval', 'Require Prior Approval')
              "
              class="py-0 my-0"
            ></v-checkbox>
          </v-col>
          <v-col v-if="shiftType === 'dedicated'" md="6">
            <v-col>
              <v-text-field
                v-model="formValues.name"
                v-validate="'required'"
                v-bind="veeValidate('name', 'OT Name *')"
              ></v-text-field>
            </v-col>
            <v-col v-if="formValues.require_prior_approval">
              <v-checkbox
                v-if="formValues.require_prior_approval"
                v-model="
                  formValues.require_post_approval_of_pre_approved_overtime
                "
                v-bind="
                  veeValidate(
                    'require_post_approval_of_pre_approved_overtime',
                    'Require Post Approval of pre approved overtime'
                  )
                "
                hint="If enabled Pre approved Overtime have to be Requested/Approved again."
              ></v-checkbox>
              <v-checkbox
                v-model="
                  formValues.grant_compensatory_time_off_for_exceeded_minutes
                "
                v-bind="
                  veeValidate(
                    'grant_compensatory_time_off_for_exceeded_minutes',
                    'Grant Compensatory Time off for exceeded minutes'
                  )
                "
                hint="If enabled Pre approved Overtime have to be Requested/Approved again."
              ></v-checkbox>
              <v-checkbox
                v-model="formValues.reduce_ot_if_actual_ot_lt_approved_ot"
                v-bind="
                  veeValidate(
                    'reduce_ot_if_actual_ot_lt_approved_ot',
                    'Reduce OT if actual overtime is less than approved overtime.'
                  )
                "
              ></v-checkbox>
              <v-checkbox
                v-model="formValues.allow_edit_of_pre_approved_overtime"
                v-bind="
                  veeValidate(
                    'allow_edit_of_pre_approved_overtime',
                    'Allow edit of pre approved overtime.'
                  )
                "
              ></v-checkbox>
            </v-col>
            <v-row v-if="!formValues.require_prior_approval" no-gutters>
              <v-col md="6">
                <v-switch
                  v-model="applicableBeforeSwitch"
                  v-bind="
                    veeValidate(
                      'applicable_before',
                      'OT Applicable Before Shift Start'
                    )
                  "
                  @change="
                    formValues.applicable_before = applicableBeforeSwitch
                      ? formValues.applicable_before
                      : 0
                  "
                ></v-switch>
              </v-col>
              <v-col v-if="applicableBeforeSwitch" md="3">
                <v-text-field
                  v-model="formValues.applicable_before"
                  v-bind="veeValidate('applicable_before', '')"
                  type="number"
                  name="quantity"
                  min="1"
                  suffix="Minutes"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="!formValues.require_prior_approval" no-gutters>
              <v-col md="6">
                <v-switch
                  v-model="applicableAfterSwitch"
                  v-bind="
                    veeValidate(
                      'applicable_after',
                      'OT Applicable After Shift End'
                    )
                  "
                  @change="
                    formValues.applicable_after = applicableAfterSwitch
                      ? formValues.applicable_after
                      : 0
                  "
                ></v-switch>
              </v-col>
              <v-col v-if="applicableAfterSwitch" md="3">
                <v-text-field
                  v-model="formValues.applicable_after"
                  v-bind="veeValidate('applicable_after', '')"
                  value="0"
                  type="number"
                  name="quantity"
                  min="1"
                  suffix="Minutes"
                ></v-text-field>
              </v-col>
            </v-row>
            <div
              v-if="applicableAfterSwitch && applicableBeforeSwitch"
              class="mx-7"
            >
              Criteria Check:
              <v-btn-toggle v-model="formValues.overtime_applicable_only_after">
                <v-btn
                  v-for="overtimeApplicableChoice in overtimeApplicableChoices"
                  :key="overtimeApplicableChoice.value"
                  :value="overtimeApplicableChoice.value"
                  small
                  v-text="overtimeApplicableChoice.text"
                ></v-btn>
              </v-btn-toggle>
            </div>
            <v-col
              v-if="applicableAfterSwitch || applicableBeforeSwitch"
              md="12"
            >
              <v-switch
                v-model="deductOvertimeAfterSwitch"
                v-bind="
                  veeValidate(
                    'compensatory_rule',
                    'Deduct overtime after criteria'
                  )
                "
                @change="formValues.deduct_overtime_after_for = 'neither'"
              ></v-switch>
              <v-radio-group
                v-if="deductOvertimeAfterSwitch"
                v-model="formValues.deduct_overtime_after_for"
                :mandatory="false"
              >
                <v-radio label="Punch In Deduction" value="punch_in"></v-radio>
                <v-radio
                  label="Punch Out Deduction"
                  value="punch_out"
                ></v-radio>
                <v-radio label="Both" value="both"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col v-if="!formValues.require_prior_approval">
              <v-select
                v-model="formValues.overtime_calculation"
                v-validate="'required'"
                :items="overtimeCalculation"
                v-bind="
                  veeValidate('overtime_calculation', 'Overtime Calculation *')
                "
                placeholder="Daily"
              ></v-select>
            </v-col>
            <v-col v-if="!formValues.require_prior_approval" md="12">
              <v-text-field
                v-model="formValues.flat_reject_value"
                type="number"
                min="0"
                placeholder="0"
                prefix="Exclude"
                suffix="Minutes of OT calculations."
              ></v-text-field>
            </v-col>
            <v-col v-if="!formValues.require_prior_approval">
              <v-switch
                v-model="formValues.claim_expires"
                v-bind="
                  veeValidate('claim_expires', 'Overtime Claim Expires After')
                "
                @change="
                  (formValues.expires_after = 0),
                    (formValues.expires_after_unit = '')
                "
              ></v-switch>
            </v-col>
            <v-col v-if="formValues.claim_expires" class="py-0">
              <v-row class="px-7">
                <v-col>
                  <v-text-field
                    v-model="formValues.expires_after"
                    v-validate="'required'"
                    v-bind="veeValidate('expires_after', 'Expires After *')"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-select
                    v-model="formValues.expires_after_unit"
                    v-validate="'required'"
                    v-bind="veeValidate('expires_after_unit', 'Unit *')"
                    :items="timeUnitChoices"
                    item-text="text"
                    item-value="value"
                  ></v-select>
                </v-col>
              </v-row>
            </v-col>
          </v-col>
          <v-col v-if="shiftType === 'dedicated'" md="6">
            <v-col>
              <v-row align="center">
                <v-col cols="5" class="grey--text">
                  <v-checkbox
                    v-model="formValues.daily_overtime_limit_applicable"
                    v-bind="
                      veeValidate(
                        'daily_overtime_limit',
                        'Daily Overtime Limit '
                      )
                    "
                    class="my-0 py-0"
                  ></v-checkbox>
                </v-col>
                <v-col v-if="formValues.daily_overtime_limit_applicable">
                  <v-text-field
                    v-model="dailyOvertime.hours"
                    v-validate="'required|min_value:0|max_value:23'"
                    v-bind="veeValidate('daily_overtime_limit_hour', 'Hours')"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col v-if="formValues.daily_overtime_limit_applicable">
                  <v-text-field
                    v-model="dailyOvertime.minutes"
                    v-validate="'required|min_value:0|max_value:59'"
                    v-bind="
                      veeValidate('daily_overtime_limit_minute', 'Minutes')
                    "
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col cols="5" class="grey--text">
                  <v-checkbox
                    v-model="formValues.weekly_overtime_limit_applicable"
                    v-bind="
                      veeValidate(
                        'weekly_overtime_limit',
                        'Weekly Overtime Limit'
                      )
                    "
                    class="my-0 py-0"
                  ></v-checkbox>
                </v-col>
                <v-col v-if="formValues.weekly_overtime_limit_applicable">
                  <v-text-field
                    v-model="weeklyOvertime.hours"
                    v-validate="'required|min_value:0|max_value:168'"
                    v-bind="veeValidate('weekly_overtime_limit_hours', 'Hours')"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col v-if="formValues.weekly_overtime_limit_applicable">
                  <v-text-field
                    v-model="weeklyOvertime.minutes"
                    v-validate="'required|min_value:0|max_value:59'"
                    v-bind="
                      veeValidate('weekly_overtime_limit_minutes', 'Minutes')
                    "
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col cols="5" class="grey--text">
                  <v-checkbox
                    v-model="formValues.monthly_overtime_limit_applicable"
                    v-bind="
                      veeValidate(
                        'monthly_overtime_limit',
                        'Monthly Overtime Limit'
                      )
                    "
                    class="my-0 py-0"
                  ></v-checkbox>
                </v-col>
                <v-col v-if="formValues.monthly_overtime_limit_applicable">
                  <v-text-field
                    v-model="monthlyOvertime.hours"
                    v-validate="'required|min_value:0|max_value:730'"
                    v-bind="
                      veeValidate('monthly_overtime_limit_hours', 'Hours')
                    "
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col v-if="formValues.monthly_overtime_limit_applicable">
                  <v-text-field
                    v-model="monthlyOvertime.minutes"
                    v-validate="'required|min_value:0|max_value:59'"
                    v-bind="
                      veeValidate('monthly_overtime_limit_minutes', 'Minutes')
                    "
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
              <overtime-field
                v-model="dailyOvertime"
                title="Daily Overtime"
                rate-type="Workday"
              ></overtime-field>
            </v-col>
            <v-col v-if="!formValues.require_prior_approval">
              <v-checkbox
                v-model="formValues.require_dedicated_work_time"
                v-bind="
                  veeValidate(
                    'require_dedicated_shift',
                    'Require Dedicated Work Time'
                  )
                "
              ></v-checkbox>
            </v-col>
            <v-divider></v-divider>
            <v-col v-if="!formValues.require_prior_approval" md="12">
              <v-switch
                v-model="formValues.off_day_overtime"
                v-bind="veeValidate('off_day_overtime', 'Offday Overtime')"
                @change="
                  (offDayOvertime = formValues.off_day_overtime
                    ? offDayOvertime
                    : { limit: 0, rates: [] }),
                    (compensatoryRule = false)
                "
              ></v-switch>
            </v-col>
            <v-col v-if="formValues.off_day_overtime">
              <v-row align="center">
                <v-col cols="5" class="grey--text">
                  Offday Overtime Limit *:
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="offDayOvertime.hours"
                    v-validate="'required|min_value:0|max_value:23'"
                    v-bind="veeValidate('off_day_overtime_limit', 'Hour')"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="offDayOvertime.minutes"
                    v-validate="'required|min_value:0|max_value:59'"
                    v-bind="
                      veeValidate('offday_overtime_limit_minute', 'Minute')
                    "
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-col>
                <overtime-field
                  v-model="offDayOvertime"
                  title="OffDay Overtime"
                  rate-type="Offday"
                ></overtime-field>
              </v-col>
              <v-col v-if="!formValues.require_prior_approval" md="12">
                <v-switch
                  v-model="compensatoryRule"
                  v-bind="veeValidate('compensatory_rule', 'Compensatory Rule')"
                  @change="formValues.overtime_after_offday = 'both'"
                ></v-switch>
                <v-radio-group
                  v-if="compensatoryRule"
                  v-model="formValues.overtime_after_offday"
                  :mandatory="false"
                >
                  <v-radio
                    label="Add Compensatory Leave and Generate OT for all hours"
                    value="both"
                  ></v-radio>
                  <v-radio
                    label="Add Compensatory Leave and Generate OT for deducted Hours"
                    value="deduction"
                  ></v-radio>
                  <v-radio
                    label="Do not generate OT if Compensatory Leave is generated"
                    value="no"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-col>
            <v-divider></v-divider>
            <v-col v-if="!formValues.require_prior_approval" md="12">
              <v-switch
                v-model="formValues.paid_holiday_affect_overtime"
                v-bind="
                  veeValidate(
                    'paid_holiday_affect_overtime',
                    'Paid Holiday Overtime'
                  )
                "
                @change="
                  (holidayOvertime = formValues.paid_holiday_affect_overtime
                    ? holidayOvertime
                    : { limit: 0, rates: [] }),
                    (holidayCompensatoryRule = false)
                "
              ></v-switch>
            </v-col>
            <v-col v-if="formValues.paid_holiday_affect_overtime">
              <v-row align="center">
                <v-col cols="5" class="grey--text">
                  Holiday Overtime Limit *:
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="holidayOvertime.hours"
                    v-validate="'required|min_value:0|max_value:23'"
                    v-bind="veeValidate('holiday_overtime_limit', 'Hour')"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="holidayOvertime.minutes"
                    v-validate="'min_value:0|max_value:59'"
                    v-bind="
                      veeValidate('holiday_overtime_limit_minute', 'Minute')
                    "
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
              <overtime-field
                v-model="holidayOvertime"
                title="Paid Holiday Overtime"
                rate-type="Holiday"
              ></overtime-field>
              <v-col md="12">
                <v-switch
                  v-model="holidayCompensatoryRule"
                  v-bind="veeValidate('compensatory_rule', 'Compensatory Rule')"
                  @change="formValues.overtime_after_holiday = 'both'"
                ></v-switch>
                <v-radio-group
                  v-if="holidayCompensatoryRule"
                  v-model="formValues.overtime_after_holiday"
                  :mandatory="false"
                >
                  <v-radio
                    label="Add Compensatory Leave and Generate OT for all hours"
                    value="both"
                  ></v-radio>
                  <v-radio
                    label="Add Compensatory Leave and Generate OT for deducted Hours"
                    value="deduction"
                  ></v-radio>
                  <v-radio
                    label="Do not generate OT if Compensatory Leave is generated"
                    value="no"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-col>
            <v-divider></v-divider>
            <v-col v-if="!formValues.require_prior_approval" md="12">
              <v-switch
                v-model="formValues.leave_affect_overtime"
                v-bind="veeValidate('leave_affect_overtime', 'Leave Overtime')"
                @change="
                  leaveOvertime = formValues.leave_affect_overtime
                    ? leaveOvertime
                    : { limit: 0, rates: [] }
                "
              ></v-switch>
            </v-col>
            <v-col v-if="formValues.leave_affect_overtime">
              <v-row align="center">
                <v-col md="5" class="grey--text">
                  Leave Overtime Limit *:
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="leaveOvertime.hours"
                    v-validate="'required|min_value:0|max_value:23'"
                    v-bind="veeValidate('leave_overtime_limit', 'Hour')"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="leaveOvertime.minutes"
                    v-validate="'min_value:0|max_value:59'"
                    v-bind="
                      veeValidate('leave_overtime_limit_minute', 'Minute')
                    "
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
              <overtime-field
                v-model="leaveOvertime"
                title="Leave Overtime"
                rate-type="Leave"
              ></overtime-field>
            </v-col>
          </v-col>
          <v-col v-if="shiftType === 'nonDedicated'" cols="12">
            <p>
              Maximum
              <input
                v-model="formValues.flat_reject_value"
                type="number"
                min="0"
              />
              hours before OT calculation
            </p>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-col class="text-right">
          <v-btn outlined color="primary" @click="clearForm">
            Clear
          </v-btn>
        </v-col>
        <v-btn color="primary" depressed type="submit">
          <v-icon left size="14" v-text="'mdi-content-save-outline'"></v-icon>
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
<script>
import OvertimeField from "@/components/Attendance/Common/OvertimeField";
import NonFieldFormErrors from "@/components/Common/FormUtils/FormErrors";
import FormMixin from "@/mixins/veeValidate";
import overtimeApi from "@/api/attendance/overtime";
export default {
  components: { NonFieldFormErrors, OvertimeField },
  mixins: [FormMixin],
  props: {
    actionData: {
      type: Object,
      default() {
        return {
          name: "",
          daily_overtime_limit: {
            minutes: 0,
            hours: 0
          },
          off_day_overtime: false,
          off_day_overtime_limit: {
            minutes: 0,
            hours: 0
          },
          applicable_before: 0,
          applicable_after: 0,
          overtime_calculation: 1,
          require_dedicated_work_time: true,
          paid_holiday_affect_overtime: false,
          flat_reject_value: 0,
          holiday_overtime_limit: {
            minutes: 0,
            hours: 0
          },
          leave_affect_overtime: false,
          leave_overtime_limit: {
            minutes: 0,
            hours: 0
          },
          rates: [],
          overtime_after_offday: "both"
        };
      }
    },
    slug: {
      type: String,
      required: true
    },
    deleteOvertime: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formValues: this.actionData,
      shiftType: "dedicated",
      overtimeCalculation: [
        { text: "Daily", value: 1 },
        { text: "Weekly", value: 2 }
      ],
      durationChoices: [
        { text: "Daily", value: "d" },
        { text: "Weekly", value: "w" },
        { text: "Monthly", value: "m" }
      ],
      overtimeApplicableChoices: [
        { value: "both", text: "Both" },
        { value: "either", text: "Either" }
      ],
      timeUnitChoices: [
        { value: "d", text: "Days" },
        { value: "m", text: "Months" },
        { value: "y", text: "Years" }
      ],
      rates: [],
      dailyOvertime: { rates: [] },
      weeklyOvertime: { hours: 0, minutes: 0 },
      monthlyOvertime: { hours: 0, minutes: 0 },
      offDayOvertime: { rates: [] },
      holidayOvertime: { rates: [] },
      leaveOvertime: { rates: [] },
      compensatoryRule: !!this.actionData.overtime_after_offday,
      deductOvertimeAfterSwitch: !!this.actionData.deduct_overtime_after_for,
      applicableBeforeSwitch: false,
      applicableAfterSwitch: false,
      holidayCompensatoryRule: !!this.actionData.overtime_after_holiday
    };
  },
  created() {
    if (this.actionData.slug) {
      this.createOverRates();
    }
  },
  methods: {
    createOverRates() {
      this.applicableBeforeSwitch = !!this.formValues.applicable_before;
      this.applicableAfterSwitch = !!this.formValues.applicable_after;
      this.dailyOvertime = {
        minutes: this.formValues.daily_overtime_limit.minutes,
        hours: this.formValues.daily_overtime_limit.hours,
        rates:
          this.formValues.rates.filter(rate => rate.rate_type === "Workday") ||
          []
      };
      this.monthlyOvertime = {
        minutes: this.formValues.monthly_overtime_limit.minutes,
        hours: this.formValues.monthly_overtime_limit.hours
      };
      this.weeklyOvertime = {
        minutes: this.formValues.weekly_overtime_limit.minutes,
        hours: this.formValues.weekly_overtime_limit.hours
      };
      this.offDayOvertime = {
        minutes: this.get(this.formValues, "off_day_overtime_limit.minutes"),
        hours: this.get(this.formValues, "off_day_overtime_limit.hours"),
        rates:
          this.formValues.rates.filter(rate => rate.rate_type === "Offday") ||
          []
      };
      this.holidayOvertime = {
        minutes: this.get(this.formValues, "holiday_overtime_limit.minutes"),
        hours: this.get(this.formValues, "holiday_overtime_limit.hours"),
        rates:
          this.formValues.rates.filter(rate => rate.rate_type === "Holiday") ||
          []
      };
      this.leaveOvertime = {
        minutes: this.get(this.formValues, "leave_overtime_limit.minutes"),
        hours: this.get(this.formValues, "leave_overtime_limit.hours"),
        rates:
          this.formValues.rates.filter(rate => rate.rate_type === "Leave") || []
      };
    },
    cancelForm() {
      this.$emit("dismissForm");
    },
    clearForm() {
      this.errors.clear();
      delete this.formValues.flat_reject_value;
      this.$refs.overtimeSettings.reset();
      this.clearNonFieldErrors();
    },
    getFormAction() {
      if (this.deleteOvertime) return this.deleteOvertimeItem();
      return this.formValues.slug
        ? this.updateOvertime()
        : this.createOvertime();
    },
    async createOvertime() {
      if (await this.validateAllFields()) {
        if (!this.compensatoryRule) {
          delete this.formValues.overtime_after_offday;
        }
        if (!this.holidayCompensatoryRule) {
          delete this.formValues.overtime_after_holiday;
        }
        this.constructFormData();

        this.$http
          .post(overtimeApi.postOvertimeSettings(this.slug), this.formValues)
          .then(() => {
            this.$emit("dismissForm");
            this.notifyUser("Successfully created Overtime.");
          })
          .catch(error => {
            this.notifyInvalidFormResponse();
            this.pushErrors(error);
          });
      }
    },
    async updateOvertime() {
      if (await this.validateAllFields()) {
        if (!this.compensatoryRule) {
          delete this.formValues.overtime_after_offday;
        }
        if (!this.holidayCompensatoryRule) {
          delete this.formValues.overtime_after_holiday;
        }
        this.constructFormData();
        this.$http
          .put(
            overtimeApi.updateOvertimeSettings(this.slug, this.actionData.slug),
            this.formValues
          )
          .then(() => {
            this.$emit("dismissForm");
            this.notifyUser("Successfully updated Overtime.");
          })
          .catch(error => {
            this.notifyInvalidFormResponse();
            this.pushErrors(error);
          });
      }
    },
    constructFormData() {
      this.formValues.daily_overtime_limit =
        parseInt(this.dailyOvertime.minutes) +
        parseInt(this.dailyOvertime.hours) * 60;
      this.formValues.weekly_overtime_limit =
        parseInt(this.weeklyOvertime.minutes) +
        parseInt(this.weeklyOvertime.hours) * 60;
      this.formValues.weekly_overtime_limit =
        parseInt(this.weeklyOvertime.minutes) +
        parseInt(this.weeklyOvertime.hours) * 60;
      this.formValues.off_day_overtime_limit =
        parseInt(this.offDayOvertime.minutes) +
        parseInt(this.offDayOvertime.hours) * 60;
      this.formValues.holiday_overtime_limit =
        parseInt(this.holidayOvertime.minutes) +
        parseInt(this.holidayOvertime.hours) * 60;
      this.formValues.leave_overtime_limit =
        parseInt(this.leaveOvertime.minutes) +
        parseInt(this.leaveOvertime.hours) * 60;
      this.formValues.rates = [
        ...this.dailyOvertime.rates,
        ...this.offDayOvertime.rates,
        ...this.holidayOvertime.rates,
        ...this.leaveOvertime.rates
      ];
      this.formValues.rates = this.formValues.rates.filter(
        rates => rates.rate || rates.overtime_after
      );
    }
  }
};
</script>
<style scoped>
.numberPicker {
  width: 55px !important;
  border: 1px solid grey;
}
</style>
