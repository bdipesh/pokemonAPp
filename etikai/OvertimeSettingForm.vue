--- Overtime Request Table -----
<template>
  <v-card>
    <vue-card-title
      :title="heading.title"
      :subtitle="heading.subheading"
      icon="mdi-file-document"
    >
      <template slot="actions">
        <v-btn
          v-if="as === 'user'"
          depressed
          color="primary"
          @click="(requestDetail = null), (requestForm = true)"
        >
          Request
        </v-btn>
      </template>
    </vue-card-title>
    <v-divider></v-divider>
    <v-tabs v-model="active" show-arrows slider-color="blue" expand>
      <v-tab
        v-for="tab in Object.keys($options.tabs)"
        :key="tab"
        ripple
        :disabled="loading"
        @click="filter.status = tab"
      >
        <span class="pr-2 text-capitalize">
          {{ tab }}
        </span>
        <v-chip :color="$options.tabs[tab]" class="white--text" small>
          {{ response.statistics ? response.statistics[tab] : 0 }}
        </v-chip>
      </v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="fetchedResults"
      :sort-desc.sync="pagination.descending"
      :sort-by.sync="pagination.sortBy"
      :page.sync="pagination.page"
      :items-per-page.sync="pagination.rowsPerPage"
      :footer-props="footerProps"
      :server-items-length="pagination.totalItems"
      :mobile-breakpoint="0"
      must-sort
    >
      <template slot="item" slot-scope="props">
        <tr>
          <td v-if="as !== 'user'">
            <vue-user :user="props.item.sender"></vue-user>
          </td>
          <td>
            <div>
              {{
                props.item.created_at
                  ? props.item.created_at.substring(0, 10)
                  : "2017-23-34"
              }}
            </div>
            <div class="grey--text">
              {{
                props.item.created_at
                  ? getTime(props.item.created_at)
                  : "02:34:33 AM"
              }}
            </div>
          </td>
          <td>
            <div>
              {{
                props.item.overtime_date
                  ? props.item.overtime_date.substring(0, 10)
                  : "2017-23-34"
              }}
            </div>
            <div class="grey--text">
              {{
                props.item.overtime_date
                  ? getTime(props.item.overtime_date)
                  : "02:34:33 AM"
              }}
            </div>
          </td>
          <td>
            {{ props.item.overtime_duration || "5 hr" }}
          </td>
          <td>
            <approval-chip
              v-if="props.item.status === 'Requested'"
              :status="props.item.status"
              :user-detail="props.item.recipient"
            ></approval-chip>
            <v-chip
              v-else
              outlined
              :color="$options.tabs[props.item.status]"
              small
            >
              {{ props.item.status }}
            </v-chip>
          </td>
          <td>
            <vue-context-menu
              :context-list="[
                {
                  name: 'View Details',
                  icon: 'mdi-eye-outline',
                  color: 'blue'
                },
                {
                  name: 'Edit Request',
                  hide:
                    as !== 'user' ||
                    props.item.status !== 'Approved' ||
                    !props.item.editable,
                  icon: 'mdi-pencil',
                  color: 'blue'
                },
                {
                  name: 'Cancel Request',
                  icon: 'mdi-cancel',
                  hide: as !== 'user' || props.item.status !== 'Requested',
                  color: 'red'
                }
              ]"
              @click0="(requestDetail = props.item), (showRequestDetail = true)"
              @click1="(requestDetail = props.item), (requestForm = true)"
              @click2="cancelRequest(props.item.id)"
            ></vue-context-menu>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <data-table-no-data :loading="loading"></data-table-no-data>
      </template>
    </v-data-table>
    <v-dialog
      v-model="requestForm"
      scrollable
      persistent
      width="960"
      @keydown.esc="requestForm = false"
    >
      <overtime-request-form
        v-if="requestForm"
        :as="as"
        :action-data="requestDetail"
        @create="
          (requestForm = false), (requestDetail = {}), loadDataTableChange()
        "
        @close="(requestForm = false), (requestDetail = {})"
      ></overtime-request-form>
    </v-dialog>
    <v-dialog
      v-model="showRequestDetail"
      scrollable
      persistent
      width="960"
      @keydown.esc="showRequestDetail = false"
    >
      <overtime-request-detail
        v-if="showRequestDetail"
        :request-detail="requestDetail"
        :as="as"
        @create="(showRequestDetail = false), loadDataTableChange()"
        @close="showRequestDetail = false"
      ></overtime-request-detail>
    </v-dialog>
    <v-dialog
      v-model="openCancelForm"
      persistent
      width="500"
      @keydown.esc="openCancelForm = false"
    >
      <overtime-cancel-dialog
        v-if="openCancelForm"
        :endpoint="cancelEndpoint"
        @close="openCancelForm = false"
        @success="(openCancelForm = false), loadDataTableChange()"
      ></overtime-cancel-dialog>
    </v-dialog>
  </v-card>
</template>
<script>
import VueContextMenu from "@/components/Common/LayoutUtils/VueContextMenu";
import dataTableMixin from "@/mixins/forms/dataTableMixin";
import requestApi from "@/api/attendance/overtimeApproval";
import OvertimeRequestForm from "@/components/Attendance/Overtime/OvertimeRequestForm";
import ApprovalChip from "@/components/Common/LayoutUtils/ApprovalChip";
import OvertimeRequestDetail from "@/components/Attendance/Overtime/OvertimeRequestDetail";
import VueUser from "@/components/Common/LayoutUtils/VueUser";
import DataTableNoData from "@/components/Common/LayoutUtils/DataTableNoData";
import OvertimeCancelDialog from "@/components/Attendance/Overtime/OvertimeCancelDialog";
export default {
  components: {
    OvertimeCancelDialog,
    DataTableNoData,
    VueUser,
    OvertimeRequestDetail,
    ApprovalChip,
    OvertimeRequestForm,
    VueContextMenu
  },
  mixins: [dataTableMixin],
  props: {
    heading: {
      type: Object,
      required: true
    },
    as: {
      type: String,
      default: ""
    }
  },
  tabs: {
    Requested: "orange",
    Forwarded: "purple",
    Approved: "green",
    Cancelled: "grey",
    Declined: "red",
    All: "blue"
  },
  data() {
    return {
      showRequestDetail: false,
      requestForm: false,
      requestDetail: {},
      openCancelForm: false,
      cancelEndpoint: "",
      headers: [
        { text: "Requested By", value: "full_name" },
        { text: "Request On", value: "created_at" },
        { text: "Request For", value: "overtime_date" },
        { text: "Duration", value: "overtime_duration" },
        { text: "Status", value: "title", sortable: false },
        { text: "Actions", value: "title", sortable: false }
      ],
      dataTableFetch: true,
      filter: {
        status: "Requested",
        user: "",
        as: this.as === "user" ? "" : this.as
      },
      active: 0
    };
  },
  computed: {
    DataTableFilter() {
      return {
        status: this.filter.status === "All" ? "" : this.filter.status,
        user: this.filter.user,
        as: this.as
      };
    }
  },
  created() {
    if (this.as === "user") {
      this.headers.shift();
    }
    this.crud.endpoint.common = requestApi.getOvertimeApproval(
      this.getOrganizationSlug
    );
  },
  methods: {
    getTime(date) {
      return this.$dayjs(date).format("hh:mm:ss a");
    },
    cancelRequest(id) {
      this.cancelEndpoint = requestApi.cancelOvertimeApproval(
        this.getOrganizationSlug,
        id
      );
      this.openCancelForm = true;
    }
  }
};
</script>
<style scoped></style>

------ Overtime Request Form -------
<template>
  <v-card>
    <vue-card-title
      :title="'Request Pre Approval overtime'"
      :subtitle="'Here you can request pre approval overtime'"
      :icon="'mdi-send'"
    ></vue-card-title>
    <v-card-text>
      <non-field-form-errors
        v-if="nonFieldErrors"
        :non-field-errors="nonFieldErrors"
      ></non-field-form-errors>
      <v-row>
        <v-col>
          <vue-date-picker
            v-model="formValues.overtime_date"
            v-validate="'required'"
            :disabled="!!(actionData && actionData.id)"
            prepend-inner-icon="mdi-calendar"
            v-bind="veeValidate('requested_for', 'Request For *')"
          ></vue-date-picker>
        </v-col>
        <v-col>
          <vue-time-picker
            v-model="formValues.overtime_duration"
            v-validate="'required'"
            prepend-inner-icon="mdi-clock"
            v-bind="veeValidate('overtime_duration', 'Duration *')"
          ></vue-time-picker>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="formValues.remarks"
            v-validate="'required|max:255'"
            prepend-inner-icon="mdi-information-outline"
            counter="255"
            rows="3"
            v-bind="veeValidate('remarks', 'Remarks *')"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text class="black--text" @click="$emit('close')">
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        depressed
        :loading="loading"
        @click="insertData"
        v-text="'Save'"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import VueDatePicker from "@/components/Common/FormUtils/VueDatePicker";
import crudMixin from "@/mixins/forms/crudMixin";
import requestApi from "@/api/attendance/overtimeApproval";
import insertUpdateFormMixin from "@/mixins/forms/insertUpdateFormMixin";
import VueTimePicker from "@/components/Common/FormUtils/VueTimePicker";
export default {
  components: { VueTimePicker, VueDatePicker },
  mixins: [insertUpdateFormMixin, crudMixin],
  props: {
    actionData: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {
      formValues: {
        overtime_duration: "00:00"
      },
      crud: {
        name: "Approval Request",
        endpoint: {
          common: "",
          put: ""
        },
        id: "id"
      }
    };
  },
  created() {
    this.crud.endpoint.common = requestApi.getOvertimeApproval(
      this.getOrganizationSlug
    );
    if (this.actionData.id) {
      this.constructFormValues();
      this.crud.endpoint.common = requestApi.putOvertimeApproval(
        this.getOrganizationSlug,
        this.actionData.id
      );
    } else {
      this.formValues = {
        overtime_duration: "00:00"
      };
    }
  },
  methods: {
    getFormValues() {
      if (this.formValues.overtime_duration.length === 5) {
        this.formValues.overtime_duration =
          this.formValues.overtime_duration + ":00";
      }
      return this.formValues;
    },
    constructFormValues() {
      this.formValues = {
        id: this.actionData.id,
        overtime_duration: this.actionData.overtime_duration,
        overtime_date: this.actionData.overtime_date,
        remarks: this.actionData.request_remarks
      };
    }
  }
};
</script>

<style scoped></style>

==== Overtime Request Detail ======

<template>
  <v-card>
    <vue-card-title
      :icon="'mdi-send'"
      :title="'Request Detail'"
      :subtitle="'Request Detail Summary'"
      :closable="!!requestId"
      :dark="!!requestId"
      @close="$emit('close')"
    ></vue-card-title>
    <v-divider></v-divider>
    <v-card-text v-if="response">
      <non-field-form-errors
        v-if="nonFieldErrors"
        :non-field-errors="nonFieldErrors"
      ></non-field-form-errors>
      <v-row>
        <v-col v-if="as !== 'user'">
          <div class="font-weight-medium">
            <v-icon small v-text="'mdi-account'"></v-icon>
            Requested By
          </div>
          <vue-user class="mx-5" :user="response.sender"></vue-user>
        </v-col>
        <v-col>
          <div class="font-weight-medium">
            <v-icon small v-text="'mdi-calendar'"></v-icon>
            Requested On
          </div>
          <div class="mx-5">
            {{
              response.created_at ? response.created_at.substring(0, 10) : ""
            }}
          </div>
        </v-col>
        <v-col>
          <div class="font-weight-medium">
            <v-icon small v-text="'mdi-calendar'"></v-icon>
            Requested For
          </div>
          <div class="mx-5">
            {{
              response.overtime_date
                ? response.overtime_date.substring(0, 10)
                : ""
            }}
          </div>
        </v-col>
        <v-col>
          <div class="font-weight-medium">
            <v-icon small v-text="'mdi-clock'"></v-icon>
            Overtime Duration
          </div>
          <div class="mx-5">
            {{ response ? response.overtime_duration : "" }}
          </div>
        </v-col>
        <v-col cols="12">
          <div class="font-weight-medium">
            <v-icon small v-text="'mdi-information-outline'"></v-icon>
            Remarks
          </div>
          <div class="mx-5">
            {{ response ? response.request_remarks : "" }}
          </div>
        </v-col>
        <v-col class="blue-grey lighten-5" cols="12">
          <v-row justify="start">
            <v-col cols="12">
              <v-timeline class="py-0 my-0">
                <v-timeline-item
                  v-for="(item, i) in response.histories"
                  :key="i"
                  right
                  :color="
                    ['declined', 'cancelled'].includes(
                      item.action_performed.toLowerCase()
                    )
                      ? 'danger'
                      : 'success'
                  "
                  :icon="
                    ['declined', 'cancelled'].includes(
                      item.action_performed.toLowerCase()
                    )
                      ? 'mdi-close'
                      : 'mdi-check'
                  "
                  show-dot
                  small
                >
                  <div class="font-weight-medium">
                    {{ `${item.action_performed_by.full_name} has  ` }}
                    <span
                      :class="$options.tabs[item.action_performed] + '--text'"
                    >
                      {{ item.action_performed }}
                    </span>
                    this Pre Overtime Request with remarks
                  </div>
                  <div>
                    <span
                      class="font-weight-medium"
                      v-text="item.remarks"
                    ></span>
                  </div>
                  <template v-if="item.created_at" slot="opposite"
                    ><div
                      class="font-weight-bold"
                      v-text="humanizeDate(item.created_at)"
                    ></div>
                    <div class="" v-text="humanizeTime(item.created_at)"></div>
                  </template>
                </v-timeline-item>
              </v-timeline>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          v-if="
            as !== 'user' &&
              !!['Forwarded', 'Requested'].includes(response.status)
          "
          cols="12"
        >
          <v-textarea
            v-model="formValues.remarks"
            v-validate="'required|max:255'"
            counter="255"
            v-bind="veeValidate('remarks', 'Remarks *')"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions v-if="response">
      <v-spacer></v-spacer>
      <v-btn text class="black--text" @click="$emit('close')">
        Cancel
      </v-btn>
      <v-btn
        v-if="
          permissions.deny &&
            as !== 'user' &&
            ['Requested', 'Forwarded'].includes(response.status)
        "
        color="danger"
        depressed
        class="white--text"
        :loading="loading"
        @click="requestAction('decline')"
      >
        Decline
      </v-btn>
      <v-btn
        v-if="
          permissions.forward &&
            as !== 'hr' &&
            as !== 'user' &&
            ['Requested', 'Forwarded'].includes(response.status)
        "
        color="purple"
        depressed
        class="white--text"
        :loading="loading"
        @click="requestAction('forward')"
      >
        Forward
      </v-btn>
      <v-btn
        v-if="
          permissions.forward &&
            as !== 'user' &&
            ['Requested', 'Forwarded'].includes(response.status)
        "
        color="success"
        depressed
        class="white--text"
        :loading="loading"
        @click="requestAction('approve')"
      >
        Approve
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import crudMixin from "@/mixins/forms/crudMixin";
import getFormMixin from "@/mixins/forms/getFormMixin";
import VueUser from "@/components/Common/LayoutUtils/VueUser";
import requestApi from "@/api/attendance/overtimeApproval";
import { mapGetters, mapMutations } from "vuex";
import permissionApi from "@/api/permission/index";
import insertUpdateFormMixin from "@/mixins/forms/insertUpdateFormMixin";
import notificationApi from "@/api/notifications";
export default {
  components: { VueUser },
  mixins: [insertUpdateFormMixin, crudMixin, getFormMixin],
  props: {
    requestDetail: {
      type: Object,
      default() {
        return {};
      }
    },
    as: {
      type: String,
      default: ""
    },
    requestId: {
      type: [String, Number],
      default: ""
    },
    notificationId: {
      type: [String, Number],
      default: ""
    }
  },
  tabs: {
    Requested: "orange",
    Forwarded: "purple",
    Approved: "green",
    Cancelled: "red",
    Decline: "red",
    All: "blue"
  },
  data() {
    return {
      formValues: {
        remarks: ""
      },
      orgSlug: "",
      permissions: { approve: true, deny: true, forward: true }
    };
  },
  computed: {
    ...mapGetters({
      getSupervisorSwitchedOrganization: "supervisor/getOrganizationSlug"
    })
  },
  created() {
    this.orgSlug =
      this.as === "supervisor"
        ? this.getSupervisorSwitchedOrganization
        : this.getOrganizationSlug;
    this.$nextTick(() => {
      this.crud.endpoint.common =
        requestApi.getOvertimeDetail(
          this.orgSlug,
          this.requestId || this.requestDetail.id
        ) + `?as=${this.requestId ? "supervisor" : this.as}`;
      this.getData();
    });
    if (this.as === "supervisor") {
      this.getSupervisorPermission();
    }
  },
  methods: {
    ...mapMutations({
      setUnreadNotificationCount: "notification/setUnreadNotificationCount"
    }),
    async requestAction(action) {
      this.crud.endpoint.post =
        requestApi.requestAction(
          this.orgSlug,
          this.requestId || this.requestDetail.id,
          action
        ) + `?as=${this.requestId ? "supervisor" : this.as}`;
      this.crud.message = `Successfully ${action} request.`;
      await this.insertData();
    },
    processAfterCreateSuccess() {
      this.refresh();
    },
    humanizeDate(date) {
      return this.$dayjs(date).format("YYYY-MM-DD");
    },
    refresh() {
      if (this.notificationId) {
        this.$http
          .post(notificationApi.readNotification(this.notificationId))
          .then(() => {
            this.setUnreadNotificationCount(0); // Reset the Notification list and update the count
          })
          .catch(function() {
            this.notifyUser("Something went wrong", "red");
          });
      }
      this.$emit("close");
    },
    getSupervisorPermission() {
      if (this.supervisor || this.notificationId) {
        this.permissions = {};
        this.$http
          .get(permissionApi.getSubordinatePermission(this.getAuthStateUserId))
          .then(response => {
            this.permissions = response;
          });
      }
    },
    humanizeTime(timeStamp) {
      const date = this.$dayjs(timeStamp).format("h:mm:ss a");
      return date === "Invalid date" ? "N/A" : date;
    }
  }
};
</script>

<style scoped></style>

===== overtime Cancel request ===
<template>
  <v-card>
    <vue-card-title
      :icon="'mdi-cancel'"
      :title="notify.title"
      :subtitle="notify.subtitle"
    ></vue-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-row>
        <v-col class="pb-0 blue-grey--text font-weight-bold" cols="12">
          {{ notify.message }}
        </v-col>
        <v-col class="py-0" cols="12">
          <v-textarea
            v-model="remarks"
            v-validate="'required|max:255'"
            counter="255"
            rows="2"
            v-bind="veeValidate('remarks', 'Remarks *')"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer> </v-spacer>
      <v-btn
        text
        color="black"
        @click="$emit('close')"
        v-text="'Cancel'"
      ></v-btn>
      <v-btn
        color="primary"
        depressed
        @click="cancelRequest"
        v-text="'Yes'"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import veeValidate from "@/mixins/veeValidate";
export default {
  mixins: [veeValidate],
  props: {
    notify: {
      type: Object,
      default() {
        return {
          title: "Confirm Your Action",
          subtitle: "Are you sure you want to Cancel this request.",
          message:
            "You are going to Cancel this request. This action can not be reverted."
        };
      }
    },
    endpoint: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      remarks: ""
    };
  },
  methods: {
    async cancelRequest() {
      if (await this.validateAllFields()) {
        this.$http.post(this.endpoint, { remarks: this.remarks }).then(() => {
          this.remarks = "";
          this.notifyUser("Successfully canceled your request");
          this.$emit("success");
        });
      }
    }
  }
};
</script>

<style scoped></style>

